import { WebSocket } from "ws";
import { InferModel, PromiseOf, and, eq, gt, lt, sql } from "drizzle-orm";
import { getSession } from "middlewares/session";
import { players, rooms } from "db/schema";
import Bull, { Queue } from "bull";
import { difficultyMappings } from "utils/constants";
import { retry } from "utils/retry";
import { produce } from "immer";
import { getRandomNumber } from "utils/random";
import { Redis } from "ioredis";
import { compareStrings, mutateString } from "utils/string";
import db from "db";

const PAYLOADTYPES = [
  "game_started",
  "game_finished",
  "wrong_answer",
  "correct_answer",
  "new_correct_answer",
  "new_round",
  "user_dropped",
  "user_joined",
  "joined_room",
  "error_occured",
] as const;
type MessageType = (typeof PAYLOADTYPES)[number];

interface GameState {
  users: string[];
  progress: {
    current_level: number;
    current_player: string;
    current_level_started_at: number;
  } | null;
  users_progress: {
    [K in string]: {
      points: number;
      answers: { level: number; timestamp: number }[];
    };
  };
}

const defaultGameState: GameState = {
  users: [],
  progress: null,
  users_progress: Object.create(null),
};

const maxLevels = 5;
// Time to wait before incrementing level, in ms
const durationBetweenLevels = 45 * 1000;
const maxPointsPerLevel = 100;

export default class ArenaRoom {
  private finishCallback: () => void;
  private redis = new Redis();
  private jobQueue: Queue<{ username: string }>;

  private roomID: string;
  private sockets: { [K in string]: WebSocket } = Object.create(null);
  // This variables should hold latest state ideally
  // GameState should be serializable
  private gameState: GameState = defaultGameState;
  private roomData: InferModel<typeof rooms>;

  constructor(
    roomID: string,
    room: InferModel<typeof rooms>,
    finishCallback: () => void
  ) {
    this.finishCallback = finishCallback;
    this.roomID = roomID;
    this.roomData = room;
    this.jobQueue = new Bull(`arena-jobs-${roomID}`, process.env.REDIS_URL);
    retry(this.initGame.bind(this), 3)
      .then(() => {
        this.jobQueue.process(async ({ data: { username } }) => {
          await this.processNewUser.call(this, username);
        });
      })
      .catch((e) => {
        console.log("Failed to initialize room, %s", e);
      });
  }

  public addNewUser(
    socket: WebSocket,
    session: NonNullable<PromiseOf<ReturnType<typeof getSession>>>
  ) {
    this.saveSocket(session.username, socket);
    this.jobQueue.add({ username: session.username }, { attempts: 2 });
  }

  private async processNewUser(username: string) {
    const socket = this.sockets[username];
    if (socket == null) throw Error("User not found");
    if (this.roomData == null) {
      return this.handleWebSocketError(username, "Room not found");
    }
    const isUserNewcomer = !this.gameState.users.includes(username);
    if (this.roomData.finished_at != null) {
      return this.handleWebSocketError(
        username,
        "Game in the room is finished"
      );
    } else if (
      this.roomData.current_size >= this.roomData.size &&
      isUserNewcomer
    ) {
      return this.handleWebSocketError(username, "Room is full");
    } else if (this.roomData.started_at != null && isUserNewcomer) {
      return this.handleWebSocketError(username, "Game already started");
    }
    socket.addEventListener("close", async () => {
      this.removeSocket(username, false);
      await this.deleteUsersFromStorage([username]);
      this.broadcastMessage("user_dropped", this.getLatestState());
    });
    socket.addEventListener("error", () => {
      this.sendMessage("error_occured", {}, username);
    });
    socket.addEventListener("message", async (message) => {
      // Check if game started, user is known and hasn't gave right answer before
      if (
        this.gameState.progress == null ||
        this.gameState.users_progress[username] == null ||
        this.gameState.users_progress[username].answers.some(
          (answer) => answer.level === this.gameState.progress!.current_level
        )
      )
        return;
      const { answer } = JSON.parse(message.data.toString());
      const corrections = compareStrings(
        JSON.parse(this.gameState.progress.current_player).playerName,
        answer
      );
      if (corrections != null) {
        return this.sendMessage("wrong_answer", { corrections }, username);
      } else {
        const timePassed =
          Date.now() - this.gameState.progress.current_level_started_at;
        const points = Math.floor(
          maxPointsPerLevel * (1 - timePassed / durationBetweenLevels)
        );
        await this.setGameState(
          produce(this.gameState, (state) => {
            state.users_progress[username].answers.push({
              level: state.progress!.current_level,
              timestamp: Date.now(),
            });
            state.users_progress[username].points += points;
          })
        );
        this.sendMessage("correct_answer", {}, username);
        return this.broadcastMessage(
          "new_correct_answer",
          this.getLatestState()
        );
      }
    });
    if (isUserNewcomer) await this.persistUser(username);
    // TODO handle not newcomer, throw error
    this.sendMessage("joined_room", this.getLatestState(), username);
    this.broadcastMessage("user_joined", this.getLatestState(), username);
  }

  private async initGame() {
    const currentGame = await this.redis.get(`room-state-${this.roomID}`);
    if (currentGame == null) {
      return;
    }
    try {
      const parsedState = JSON.parse(currentGame);
      this.gameState = parsedState;
    } catch (_) {
      console.warn("Invalid game state, ignoring");
    }
  }

  private async startGame() {
    const randomID = getRandomNumber([1, this.getRoomDifficulty()]);
    const [player] = await db
      .select({ data: players.value })
      .from(players)
      .where(eq(players.id, randomID))
      .limit(1);
    if (player == null) {
      throw Error("Couldn't get a valid player");
    }
    const startedAt = new Date();
    await Promise.all([
      this.setGameState(
        produce(this.gameState, (state) => {
          state.progress = {
            current_level: 1,
            current_player: player.data as string,
            current_level_started_at: startedAt.getTime(),
          };
        })
      ),
      db
        .update(rooms)
        .set({ started_at: startedAt })
        .where(eq(rooms.id, this.roomID)),
    ]);
    this.roomData = produce(this.roomData, (data) => {
      if (!data) return;
      data.started_at = startedAt;
    });
    this.broadcastMessage("game_started", this.getLatestState());
    setTimeout(() => {
      this.scheduleNextRound();
    }, durationBetweenLevels);
  }

  private async finishGame() {
    const finishedAt = new Date();
    await Promise.all([
      db
        .update(rooms)
        .set({ finished_at: finishedAt })
        .where(eq(rooms.id, this.roomID)),
      this.setGameState(
        produce(this.gameState, (game) => {
          game.progress = null;
        })
      ),
    ]);
    this.roomData = produce(this.roomData, (room) => {
      if (room == null) return;
      room.finished_at = finishedAt;
    });
    this.broadcastMessage("game_finished", this.getLatestState());
    for (const socketUsername in this.sockets) {
      if (this.sockets[socketUsername] == null) {
        return;
      }
      this.removeSocket(socketUsername);
    }
    this.finishCallback();
    await retry(() => this.redis.del(`room-state-${this.roomID}`), 2);
    await retry(() => this.jobQueue.close(), 2);
  }

  private async scheduleNextRound() {
    if (this.gameState.progress == null) return;
    // Check if new round is available
    if (this.gameState.progress.current_level >= maxLevels) {
      return this.finishGame();
    }
    const randomID = getRandomNumber([1, this.getRoomDifficulty()]);
    const [player] = await db
      .select({ data: players.value })
      .from(players)
      .where(eq(players.id, randomID))
      .limit(1);
    if (player == null) {
      throw Error("Couldn't get a valid player");
    }
    await this.setGameState(
      produce(this.gameState, (state) => {
        if (state.progress == null) return;
        state.progress = {
          current_level: state.progress.current_level + 1,
          current_player: player.data as string,
          current_level_started_at: Date.now(),
        };
      })
    );
    this.broadcastMessage("new_round", this.getLatestState());
    setTimeout(() => {
      this.scheduleNextRound();
    }, durationBetweenLevels);
  }

  private getLatestState() {
    return {
      room_state: this.roomData,
      game_state: produce(this.gameState, (state) => {
        const currentPlayer = state.progress?.current_player;
        if (currentPlayer == null) return;
        const parsedData = JSON.parse(currentPlayer);
        parsedData.playerName = mutateString(parsedData.playerName, "*");
        state.progress!.current_player = parsedData;
      }),
      active_users: Object.getOwnPropertyNames(this.sockets),
    };
  }

  private async setGameState(state: GameState) {
    await retry(
      () => this.redis.set(`room-state-${this.roomID}`, JSON.stringify(state)),
      2
    );
    this.gameState = state;
  }

  // Sends message to [username]
  private sendMessage(type: MessageType, message: Object, username: string) {
    for (const socketUsername in this.sockets) {
      if (this.sockets[socketUsername] == null) {
        return;
      }
      if (socketUsername === username) {
        this.sockets[socketUsername].send(JSON.stringify({ type, ...message }));
        return;
      }
    }
  }

  // Sends message to everyone except [username]
  private broadcastMessage(
    type: MessageType,
    message: Object,
    username?: string
  ) {
    for (const socketUsername in this.sockets) {
      if (this.sockets[socketUsername] == null) {
        return;
      }
      if (socketUsername === username) {
        continue;
      }
      this.sockets[socketUsername].send(JSON.stringify({ type, ...message }));
    }
  }

  private saveSocket(username: string, socket: WebSocket) {
    this.removeSocket(username, true, 1000, "New connection established");
    this.sockets[username] = socket;
  }

  private removeSocket(
    username: string,
    closeSocket = true,
    code?: number,
    reason?: string
  ) {
    if (this.sockets[username] == null) {
      return;
    }
    if (
      closeSocket === true &&
      this.sockets[username].readyState !== WebSocket.CLOSED
    )
      this.sockets[username].close(code, reason);
    delete this.sockets[username];
  }

  private async deleteUsersFromStorage(users: string[]) {
    // Drop user only if the game hasn't started
    if (this.roomData == null || this.roomData.started_at != null) return;
    await Promise.all([
      db
        .update(rooms)
        .set({ current_size: sql`${rooms.current_size} - 1` })
        .where(and(eq(rooms.id, this.roomID), gt(rooms.current_size, 0))),
      this.setGameState(
        produce(this.gameState, (game) => {
          game.users = game.users.filter((user) => !users.includes(user));
          for (const key of users) {
            delete game.users_progress[key];
          }
        })
      ),
    ]);
    this.roomData = produce(this.roomData, (room) => {
      if (room == null || room.current_size === 0) return;
      room.current_size--;
    });
  }

  private async persistUser(username: string) {
    if (this.gameState.users.includes(username)) {
      return;
    }
    const newGameState = produce(this.gameState, (state) => {
      state.users.push(username);
      state.users_progress[username] = { points: 0, answers: [] };
    });
    const [result] = await db
      .update(rooms)
      .set({ current_size: sql`${rooms.current_size} + 1` })
      .where(and(eq(rooms.id, this.roomID), lt(rooms.current_size, rooms.size)))
      .returning({ id: rooms.id });
    if (result == null) {
      // TODO Probably failed to guard race condition, handle better
      // Because no row is changed
      // TODO rethink retries
      throw Error("Race condition");
    }
    this.roomData = produce(this.roomData, (data) => {
      if (!data) return;
      data.current_size += 1;
    });
    await this.setGameState(newGameState);
    // Start game only if size is reached
    if (
      this.roomData == null ||
      this.roomData.current_size < this.roomData.size
    )
      return;
    await retry(this.startGame.bind(this), 2);
  }

  private getRoomDifficulty(): number {
    return difficultyMappings[this.roomData.difficulty];
  }

  private handleWebSocketError(username: string, reason?: string) {
    const socket = this.sockets[username];
    if (socket == null) return;
    socket.close(1011, reason);
    delete this.sockets[username];
  }
}
