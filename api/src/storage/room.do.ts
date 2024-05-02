import { Context, Hono } from "hono";
import { produce } from "immer";
import { DatabaseRoom, Env } from "../types";
import { difficultyMappings, playerCount } from "../utils/constants";
import { runInDev } from "../utils/misc/runInDev";
import { handleWebSocketError } from "../utils/misc/websocket";
import { getRandomNumber } from "../utils/random";
import { retry } from "../utils/retry";
import { compareStrings, mutateString } from "../utils/string";

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

export class ArenaRoom {
	private env: Env;
	private state: DurableObjectState;
	private storage: DurableObjectStorage;
	private sockets: { [K in string]: WebSocket } = Object.create(null);
	// This variable should hold latest state ideally
	private gameState: GameState = defaultGameState;
	private roomData: DatabaseRoom | null = null;
	private router = new Hono();

	constructor(state: DurableObjectState, env: Env) {
		this.state = state;
		this.env = env;
		this.storage = state.storage;
		this.registerRoutes();
		this.state.getWebSockets().forEach((webSocket) => {
			// The constructor may have been called when waking up from hibernation,
			// so get previously serialized metadata for any existing WebSockets.
			let username: string = webSocket.deserializeAttachment();
			this.sockets[username] = webSocket;
		});
		state.blockConcurrencyWhile(this.initGame.bind(this));
	}

	fetch(request: Request) {
		return this.router.fetch(request);
	}

	registerRoutes() {
		this.router.get("/arena/join/:id", async (c) => {
			const username = c.req.query("username");
			const roomID = c.req.param("id");
			const activeSockets = this.state.getWebSockets().reduce((acc, curr) => {
				if (curr.readyState === WebSocket.READY_STATE_OPEN) acc++;
				return acc;
			}, 0);
			this.roomData = await this.env.ARENA_DB.prepare(
				`UPDATE room SET current_size = ?
         WHERE id = ?
				 RETURNING id, creator_username, private, size, current_size, difficulty, started_at, finished_at, created_at`
			)
				.bind(activeSockets + 1, c.req.param("id"))
				.first<DatabaseRoom | null>();
			if (username == null) {
				return handleWebSocketError(c as Context, "Username not found");
			}
			if (this.roomData == null) {
				return handleWebSocketError(c as Context, "Room not found");
			}
			const isUserNewcomer = !this.gameState.users.includes(username);
			if (this.roomData.finished_at != null) {
				return handleWebSocketError(
					c as Context,
					"Game in the room is finished"
				);
			} else if (
				this.roomData.current_size >= this.roomData.size &&
				isUserNewcomer
			) {
				return handleWebSocketError(c as Context, "Room is full");
			} else if (this.roomData.started_at != null && isUserNewcomer) {
				return handleWebSocketError(c as Context, "Game already started");
			}

			const { 0: client, 1: server } = new WebSocketPair();
			this.state.acceptWebSocket(server);
			if (isUserNewcomer)
				await this.state.blockConcurrencyWhile(
					this.persistUser.bind(this, username, roomID)
				);
			this.saveSocket(username, server);
			this.sendMessage("joined_room", this.getLatestState(), username);
			this.broadcastMessage("user_joined", this.getLatestState(), username);

			return new Response(null, {
				status: 101,
				webSocket: client,
			});
		});

		this.router.onError((error, c) => {
			runInDev(this.env, () => {
				console.log(
					`Following error occured in room do: ${error.message}, stack: ${error.stack}`
				);
			});
			return c.json({ error: "error_occured" }, 500);
		});
	}

	async initGame() {
		const currentGame = await this.storage.get<GameState>("game");
		if (currentGame == null) {
			return;
		}
		this.gameState = currentGame;
	}

	async startGame(roomID: string) {
		const randomID = getRandomNumber([1, this.getRoomDifficulty()]);
		const player = await this.env.PLAYERSKV.get(randomID.toString());
		if (player == null) {
			throw Error("Couldn't get a valid player");
		}
		const startedAt = Date.now();
		await Promise.all([
			this.setGameState(
				produce(this.gameState, (state) => {
					state.progress = {
						current_level: 1,
						current_player: player,
						current_level_started_at: Date.now(),
					};
				})
			),
			this.env.ARENA_DB.prepare("UPDATE room SET started_at = ? WHERE id = ?")
				.bind(startedAt, roomID)
				.run(),
		]);
		this.roomData = produce(this.roomData, (data) => {
			if (!data) return;
			data.started_at = startedAt;
		});
		this.broadcastMessage("game_started", this.getLatestState());
		setTimeout(() => {
			this.scheduleNextRound(roomID);
		}, durationBetweenLevels);
	}

	async finishGame(roomID: string) {
		const finishedAt = Date.now();
		await Promise.all([
			this.env.ARENA_DB.prepare("UPDATE room SET finished_at = ? WHERE id = ?")
				.bind(finishedAt, roomID)
				.run(),
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
	}

	async scheduleNextRound(roomID: string) {
		if (this.gameState.progress == null) return;
		// Check if new round is available
		if (this.gameState.progress.current_level >= maxLevels) {
			return this.finishGame(roomID);
		}
		const randomID = getRandomNumber([1, this.getRoomDifficulty()]);
		const player = await this.env.PLAYERSKV.get(randomID.toString());
		if (player == null) {
			throw Error("Couldn't get a valid player");
		}
		await this.setGameState(
			produce(this.gameState, (state) => {
				if (state.progress == null) return;
				state.progress = {
					current_level: state.progress.current_level + 1,
					current_player: player,
					current_level_started_at: Date.now(),
				};
			})
		);
		this.broadcastMessage("new_round", this.getLatestState());
		setTimeout(() => {
			this.scheduleNextRound(roomID);
		}, durationBetweenLevels);
	}

	getLatestState() {
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

	async setGameState(state: GameState) {
		await retry(() => this.storage.put("game", state), 2);
		this.gameState = state;
	}

	// Sends message to [username]
	sendMessage(type: MessageType, message: Object, username: string) {
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
	broadcastMessage(type: MessageType, message: Object, username?: string) {
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

	saveSocket(username: string, socket: WebSocket) {
		socket.serializeAttachment(username);
		this.removeSocket(username, true, 1000, "New connection established");
		this.sockets[username] = socket;
	}

	removeSocket(
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
			this.sockets[username].readyState !== WebSocket.READY_STATE_CLOSED
		)
			this.sockets[username].close(code, reason);
		delete this.sockets[username];
	}

	async deleteUsersFromStorage(users: string[]) {
		// Drop user only if the game hasn't started
		if (this.roomData == null || this.roomData.started_at != null) return;
		await Promise.all([
			this.env.ARENA_DB.prepare(
				"UPDATE room SET current_size = current_size - 1 WHERE current_size > 0 AND id = ?"
			)
				.bind(this.roomData.id)
				.run(),
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

	async persistUser(username: string, roomID: string) {
		if (this.gameState.users.includes(username)) {
			return;
		}
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
		await retry(() => this.startGame(roomID), 2);
	}

	getRoomDifficulty(): number {
		return this.roomData == null
			? playerCount
			: difficultyMappings[this.roomData.difficulty];
	}

	async webSocketMessage(ws: WebSocket, message: ArrayBuffer | string) {
		const username = ws.deserializeAttachment();
		// Check if game started, user is known and hasn't gave right answer before
		if (
			this.gameState.progress == null ||
			this.gameState.users_progress[username] == null ||
			this.gameState.users_progress[username].answers.some(
				(answer) => answer.level === this.gameState.progress!.current_level
			)
		)
			return;
		const { answer } = JSON.parse(message.toString());
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
			return this.broadcastMessage("new_correct_answer", this.getLatestState());
		}
	}

	async webSocketClose(ws: WebSocket) {
		const username = ws.deserializeAttachment();
		this.removeSocket(username, false);
		await this.state.blockConcurrencyWhile(
			this.deleteUsersFromStorage.bind(this, [username])
		);
		this.broadcastMessage("user_dropped", this.getLatestState());
	}

	websocketError(ws: WebSocket) {
		const username = ws.deserializeAttachment();
		this.sendMessage("error_occured", {}, username);
	}
}
