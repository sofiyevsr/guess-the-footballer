import { Hono } from "hono";
import { produce } from "immer";
import { DatabaseRoom, Env } from "../types";
import { playerCount } from "../utils/constants";
import { getRandomNumber } from "../utils/random";
import { retry } from "../utils/retry";
import { compareStrings, mutateString } from "../utils/string";

const PAYLOADTYPES = [
	"game_started",
	"game_finished",
	"wrong_answer",
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
	users_progress: {},
};
const maxLevels = 5;
// Time to wait before incrementing level, in ms
const durationBetweenLevels = 45 * 1000;
const pointsOnRightAnswer = 100;

export class ArenaRoom {
	private env: Env;
	private state: DurableObjectState;
	private storage: DurableObjectStorage;
	private sockets: { [K in string]: WebSocket } = {};
	// This variable should hold latest state ideally
	private gameState: GameState = defaultGameState;
	private roomData: DatabaseRoom | null = null;
	private router = new Hono();

	constructor(state: DurableObjectState, env: Env) {
		this.state = state;
		this.env = env;
		this.storage = state.storage;
		this.registerRoutes();
		state.blockConcurrencyWhile(this.initGame.bind(this));
	}

	fetch(request: Request) {
		return this.router.fetch(request);
	}

	registerRoutes() {
		this.router.get("/arena/join/:id", async (c) => {
			const username = c.req.query("username");
			const roomID = c.req.param("id");
			this.roomData = await this.env.__D1_BETA__ARENA_DB
				.prepare(
					`SELECT id, creator_username, private, size, current_size, started_at, finished_at, created_at
           FROM room WHERE id = ?1`
				)
				.bind(c.req.param("id"))
				.first<DatabaseRoom | null>();
			if (this.roomData == null) {
				return c.notFound();
			}
			const isUserNewcomer = !this.gameState.users.includes(username);
			if (this.roomData.finished_at != null) {
				return c.json({ error: "Game in the room is finished" }, 500);
			} else if (
				this.roomData.current_size >= this.roomData.size &&
				isUserNewcomer
			) {
				return c.json({ error: "Room is full" }, 500);
			} else if (this.roomData.started_at != null && isUserNewcomer) {
				return c.json({ error: "Game already started" }, 403);
			}

			const { 0: client, 1: server } = new WebSocketPair();
			server.accept();
			server.addEventListener("close", () => {
				this.removeSocket(username, false);
				this.broadcastMessage("user_dropped", this.getLatestState());
			});
			server.addEventListener("error", () => {
				this.sendMessage("error_occured", {}, username);
			});
			server.addEventListener("message", async (message) => {
				// Check if game started, user is known and hasn't gave right answer before
				if (
					!this.gameState.users_progress.hasOwnProperty(username) ||
					this.gameState.progress == null ||
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
					await this.setGameState(
						produce(this.gameState, (state) => {
							state.users_progress[username].answers.push({
								level: state.progress!.current_level,
								timestamp: Date.now(),
							});
							state.users_progress[username].points += pointsOnRightAnswer;
						})
					);
					return this.broadcastMessage(
						"new_correct_answer",
						this.getLatestState()
					);
				}
			});
			if (isUserNewcomer)
				await this.state.blockConcurrencyWhile(
					this.persistUser.bind(this, username, roomID)
				);
			this.saveSocket(username, server);
			this.sendMessage("joined_room", this.getLatestState(), username);
			this.broadcastMessage("user_joined", this.getLatestState(), username);

			return new Response(null, { status: 101, webSocket: client });
		});

		this.router.onError((error, c) => {
			console.log(
				`Following error occured: ${error.message}`
			);
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
		const randomID = getRandomNumber([1, playerCount]);
		const player = await this.env.PLAYERSKV.get(`player:${randomID}`);
		if (player == null) {
			throw Error("Couldn't get a valid player");
		}
		const startedAt = Date.now();
		await Promise.all([
			await this.setGameState(
				produce(this.gameState, (state) => {
					state.progress = { current_level: 1, current_player: player };
				})
			),
			await this.env.__D1_BETA__ARENA_DB
				.prepare("UPDATE room SET started_at = ?1 WHERE id = ?2")
				.bind(startedAt, roomID)
				.run(),
		]);
		this.roomData = produce(this.roomData, (data) => {
			if (!data) return;
			data.started_at = startedAt;
		});
		this.broadcastMessage("game_started", this.getLatestState());
		setTimeout(() => {
			retry(() => this.scheduleNextRound(roomID), 2);
		}, durationBetweenLevels);
	}

	async finishGame(roomID: string) {
		const finishedAt = Date.now();
		await this.env.__D1_BETA__ARENA_DB
			.prepare("UPDATE room SET finished_at = ?1 WHERE id = ?2")
			.bind(finishedAt, roomID)
			.run();
		this.roomData = produce(this.roomData, (room) => {
			if (room == null) return;
			room.finished_at = finishedAt;
		});
		this.broadcastMessage("game_finished", this.getLatestState());
		for (const socketUsername in this.sockets) {
			if (!this.sockets.hasOwnProperty(socketUsername)) {
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
		const randomID = getRandomNumber([1, playerCount]);
		const player = await this.env.PLAYERSKV.get(`player:${randomID}`);
		if (player == null) {
			throw Error("Couldn't get a valid player");
		}
		await this.setGameState(
			produce(this.gameState, (state) => {
				if (state.progress == null) return;
				state.progress = {
					current_level: state.progress.current_level + 1,
					current_player: player,
				};
			})
		);
		this.broadcastMessage("new_round", this.getLatestState());
		setTimeout(() => {
			retry(() => this.scheduleNextRound(roomID), 2);
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
			if (!this.sockets.hasOwnProperty(socketUsername)) {
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
			if (!this.sockets.hasOwnProperty(socketUsername)) {
				return;
			}
			if (socketUsername === username) {
				continue;
			}
			this.sockets[socketUsername].send(JSON.stringify({ type, ...message }));
		}
	}

	saveSocket(username: string, socket: WebSocket) {
		this.removeSocket(username, true, 1000, "New connection established");
		this.sockets[username] = socket;
	}

	removeSocket(
		username: string,
		closeSocket = true,
		code?: number,
		reason?: string
	) {
		if (
			!this.sockets.hasOwnProperty(username) ||
			this.sockets[username].readyState === WebSocket.READY_STATE_CLOSED ||
			this.sockets[username].readyState === WebSocket.READY_STATE_CLOSING
		) {
			return;
		}
		if (closeSocket === true) this.sockets[username].close(code, reason);
		delete this.sockets[username];
	}

	async persistUser(username: string, roomID: string) {
		if (this.gameState.users.includes(username)) {
			return;
		}
		const newGameState = produce(this.gameState, (state) => {
			state.users.push(username);
			state.users_progress[username] = { points: 0, answers: [] };
		});
		const result = await this.env.__D1_BETA__ARENA_DB
			.prepare(
				"UPDATE room SET current_size = current_size + 1 WHERE current_size < size AND id = ?1 RETURNING id"
			)
			.bind(roomID)
			.first();
		if (result == null) {
			// TODO Probably failed to guard race condition, handle better
			// Because no row is changed
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
		await retry(() => this.startGame(roomID), 2);
	}
}
