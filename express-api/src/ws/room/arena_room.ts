import Bull, { Queue } from "bull";
import { WebSocket } from "ws";
import { InferModel, PromiseOf, and, eq, gt, lt, sql } from "drizzle-orm";
import { getSession } from "middlewares/session";
import { players, rooms } from "db/schema";
import { difficultyMappings } from "utils/constants";
import { retry } from "utils/retry";
import { produce } from "immer";
import { getRandomNumber } from "utils/random";
import { Redis } from "ioredis";
import { compareStrings, mutateString } from "utils/string";
import db from "db";

type MessageType = (typeof PAYLOADTYPES)[number];

type JobQueue =
  | {
      type: "new_user";
      username: string;
    }
  | {
      type: "schedule_dispose" | "schedule_new_round";
    };

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

const ROOM_STORE_PREFIX = "room-state-";
const ARENA_JOB_PREFIX = "arena-jobs-";

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

const defaultGameState: GameState = {
  users: [],
  progress: null,
  users_progress: Object.create(null),
};

const maxLevels = 5;
// Time to wait before incrementing level, in ms
const durationBetweenLevels = 45 * 1000;
const roomAutoCloseDuration = 30 * 60 * 1000;
const maxPointsPerLevel = 100;

export default class ArenaRoom {
  private finishCallback: () => void;
  private redis = new Redis(process.env.REDIS_URL);
  private jobQueue: Queue<JobQueue>;
  private sockets: { [K in string]: WebSocket } = Object.create(null);

  // This variables should hold latest state ideally
  // GameState should be serializable
  private gameState: GameState = defaultGameState;
  private roomData: InferModel<typeof rooms>;
  private roomID: string;

  constructor(
    roomID: string,
    room: InferModel<typeof rooms>,
    finishCallback: () => void
  ) {
    this.finishCallback = finishCallback;
    this.roomID = roomID;
    this.roomData = room;
    this.jobQueue = new Bull(
      ARENA_JOB_PREFIX + this.roomID,
      process.env.REDIS_URL,
      { defaultJobOptions: { removeOnFail: true, removeOnComplete: true } }
    );
    retry(this.initRoom.bind(this), 3, "Init room")
      .then(() => {
        this.jobQueue.process(async ({ data }) => {
          if (data.type === "new_user") {
            await this.processNewUser(data.username);
          } else if (data.type === "schedule_dispose") {
            await this.disposeSelf();
          } else if (data.type === "schedule_new_round") {
            await this.handleNextRound();
          }
        });
      })
      .catch((e) => {
        console.log("Failed to initialize room, %s", e);
        this.disposeSelf();
      });
  }

  public addNewUser(
    socket: WebSocket,
    session: NonNullable<PromiseOf<ReturnType<typeof getSession>>>
  ) {
    this.saveSocket(session.username, socket);
    this.jobQueue.add(
      { type: "new_user", username: session.username },
      { attempts: 2 }
    );
  }

  private async initRoom() {
    const currentGame = await this.redis.get(ROOM_STORE_PREFIX + this.roomID);
    if (currentGame == null) {
      return;
    }
    try {
      const parsedState = JSON.parse(currentGame);
      this.gameState = parsedState;
    } catch (_) {
      console.warn("Invalid game state, ignoring");
    }
    this.jobQueue.add(
      { type: "schedule_dispose" },
      { attempts: 2, delay: roomAutoCloseDuration }
    );
  }

  private async startGame() {
    const randomID = getRandomNumber([1, this.getRoomDifficulty()]);
    const [player] = await db
      .select({ data: players.value })
      .from(players)
      .where(eq(players.id, randomID))
      .limit(1);
    if (player == null) {
      console.log("Couldn't get valid player, disposing room...");
      return this.disposeSelf();
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
    this.scheduleNextRound();
  }

  private async processNewUser(username: string) {
    const socket = this.sockets[username];
    if (socket == null) return;
    if (this.roomData == null) {
      return this.handleWebSocketError(username, "Room not found");
    }
    const isUserNewcomer = !this.gameState.users.includes(username);
    if (this.roomData.current_size >= this.roomData.size && isUserNewcomer) {
      return this.handleWebSocketError(username, "Room is full");
    } else if (this.roomData.started_at != null && isUserNewcomer) {
      return this.handleWebSocketError(username, "Game already started");
    }
    socket.addEventListener("close", async () => {
      // Compare sockets to avoid race condition
      if (this.sockets[username] === socket) delete this.sockets[username];
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
    await this.persistUser(username);
    this.sendMessage("joined_room", this.getLatestState(), username);
    this.broadcastMessage("user_joined", this.getLatestState(), username);
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
    this.disposeSelf();
  }

  private scheduleNextRound() {
    return this.jobQueue.add(
      { type: "schedule_new_round" },
      { attempts: 2, delay: durationBetweenLevels }
    );
  }

  private async handleNextRound() {
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
      console.log("Couldn't get valid player, disposing room...");
      return this.disposeSelf();
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
    this.scheduleNextRound();
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
      () =>
        this.redis.set(
          `room-state-${this.roomID}`,
          JSON.stringify(state),
          "EX",
          roomAutoCloseDuration / 1000
        ),
      2,
      "Set game state"
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
    const [result] = await db
      .update(rooms)
      .set({ current_size: sql`${rooms.current_size} + 1` })
      .where(and(eq(rooms.id, this.roomID), lt(rooms.current_size, rooms.size)))
      .returning({ id: rooms.id });
    if (result == null) {
      return;
    }
    this.roomData = produce(this.roomData, (data) => {
      if (!data) return;
      data.current_size += 1;
    });
    const newGameState = produce(this.gameState, (state) => {
      state.users.push(username);
      state.users_progress[username] = { points: 0, answers: [] };
    });
    await this.setGameState(newGameState);
    // Start game only if size is reached
    if (
      this.roomData == null ||
      this.roomData.current_size < this.roomData.size
    )
      return;
    await retry(this.startGame.bind(this), 2, "Start game");
  }

  private getRoomDifficulty(): number {
    return difficultyMappings[this.roomData.difficulty];
  }

  private saveSocket(username: string, socket: WebSocket) {
    this.removeSocket(username, 1000, "New connection established");
    this.sockets[username] = socket;
  }

  private removeSocket(username: string, code?: number, reason?: string) {
    if (this.sockets[username] == null) {
      return;
    }
    if (
      this.sockets[username].readyState !== WebSocket.CLOSED &&
      this.sockets[username].readyState !== WebSocket.CLOSING
    )
      this.sockets[username].close(code, reason);
    delete this.sockets[username];
  }

  private handleWebSocketError(username: string, reason?: string) {
    const socket = this.sockets[username];
    if (socket == null) return;
    socket.close(1011, reason);
    delete this.sockets[username];
  }

  private async disposeSelf() {
    for (const socketUsername in this.sockets) {
      if (this.sockets[socketUsername] == null) {
        return;
      }
      this.removeSocket(socketUsername);
    }
    this.finishCallback();
    await Promise.all([
      retry(
        () => this.redis.del(ROOM_STORE_PREFIX + this.roomID),
        2,
        "Redis room delete"
      ),
      retry(() => this.jobQueue.close(), 2, "Job Queue close"),
    ]);
  }
}
