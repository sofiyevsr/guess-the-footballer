import { Context, Hono } from "hono";
import { produce } from "immer";
import { Env } from "../types";
import { runInDev } from "../utils/misc/runInDev";
import { handleWebSocketError } from "../utils/misc/websocket";
import { getRandomItemsFromArray } from "../utils/random";
import { retry } from "../utils/retry";
import { compareStrings, mutateString } from "../utils/string";
import { and, eq, gt, inArray, InferSelectModel, lt, sql } from "drizzle-orm";
import { room, player } from "../db/schemas";
import { getDB } from "../db";
import { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../db/schemas";
import { ApiError } from "../utils/error";

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

type Players = InferSelectModel<typeof player>[];

interface RoomState extends InferSelectModel<typeof room> {
	list: { playerIDs: string };
}

interface GameState {
	users: string[];
	progress: {
		currentLevel: number;
		currentPlayer: string;
		currentLevelStartedAt: number;
	} | null;
	usersProgress: {
		[K in string]: {
			points: number;
			answers: { level: number; timestamp: number }[];
		};
	};
}

const defaultGameState: GameState = {
	users: [],
	progress: null,
	usersProgress: Object.create(null),
};

const maxPointsPerLevel = 100;

export class ArenaRoom {
	private env: Env;
	private state: DurableObjectState;
	private storage: DurableObjectStorage;
	private sockets: { [K in string]: WebSocket } = Object.create(null);
	private db: DrizzleD1Database<typeof schema>;
	// This variable should hold latest state ideally
	private gameState: GameState = defaultGameState;
	private roomData: RoomState | undefined = undefined;
	private players: Players | undefined = undefined;
	private router = new Hono();

	constructor(state: DurableObjectState, env: Env) {
		this.state = state;
		this.env = env;
		this.storage = state.storage;
		this.db = getDB(env.ARENA_DB);
		this.registerRoutes();
		this.state.setWebSocketAutoResponse(
			new WebSocketRequestResponsePair("ping", "pong")
		);
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
			const usersToDrop: string[] = [];
			const users = this.gameState.users;
			for (let i = 0; i < users.length; i++) {
				if (this.sockets[users[i]] == null) {
					usersToDrop.push(users[i]);
				}
			}
			await this.dropUsers(usersToDrop);
			this.roomData = await this.db.query.room.findFirst({
				where: eq(room.id, c.req.param("id")),
				with: { list: { columns: { playerIDs: true } } },
			});
			if (username == null) {
				return handleWebSocketError(c as Context, "Username not found");
			}
			if (this.roomData == null) {
				return handleWebSocketError(c as Context, "Room not found");
			}
			const isUserNewcomer = !this.gameState.users.includes(username);
			if (this.roomData.finishedAt != null) {
				return handleWebSocketError(
					c as Context,
					"Game in the room is finished"
				);
			} else if (this.roomData.startedAt != null && isUserNewcomer) {
				return handleWebSocketError(c as Context, "Game already started");
			}

			const { 0: client, 1: server } = new WebSocketPair();
			this.state.acceptWebSocket(server);
			if (isUserNewcomer) {
				const activeSockets = this.state.getWebSockets().reduce((acc, curr) => {
					if (curr.readyState === WebSocket.READY_STATE_OPEN) acc++;
					return acc;
				}, 0);

				const [result] = await this.db
					.update(room)
					.set({ currentSize: activeSockets, id: c.req.param("id") })
					.where(
						and(eq(room.id, c.req.param("id")), lt(room.currentSize, room.size))
					)
					.returning({ id: room.id });
				if (result)
					this.roomData = produce(this.roomData, (data) => {
						data.currentSize = activeSockets;
					});
				await this.state.blockConcurrencyWhile(
					this.persistUser.bind(this, username, roomID)
				);
			}
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
		const [players, currentGame] = await Promise.all([
			this.storage.get<Players>("players"),
			this.storage.get<GameState>("game"),
		]);
		if (currentGame != null) {
			this.gameState = currentGame;
		}
		if (players != null) {
			this.players = players;
		}
	}

	async startGame(roomID: string) {
		const startedAt = Date.now();
		const players = await this.getRandomPlayers();
		await Promise.all([
			this.setPlayers(players),
			this.setGameState(
				produce(this.gameState, (state) => {
					state.progress = {
						currentLevel: 1,
						currentPlayer: JSON.stringify(players[0].data),
						currentLevelStartedAt: Date.now(),
					};
				})
			),
			this.db
				.update(room)
				.set({ startedAt: new Date(startedAt) })
				.where(eq(room.id, roomID)),
		]);
		this.roomData = produce(this.roomData, (data) => {
			if (!data) return;
			data.startedAt = new Date(startedAt);
			data.levels = Math.min(data.levels, players.length);
		});
		this.broadcastMessage("game_started", this.getLatestState());
		setTimeout(() => {
			this.scheduleNextRound(roomID);
		}, this.roomData!.durationBetweenLevels * 1000);
	}

	async finishGame(roomID: string) {
		const finishedAt = Date.now();
		await Promise.all([
			this.db
				.update(room)
				.set({ finishedAt: new Date(finishedAt) })
				.where(eq(room.id, roomID)),
			this.setGameState(
				produce(this.gameState, (game) => {
					game.progress = null;
				})
			),
		]);
		this.roomData = produce(this.roomData, (room) => {
			if (room == null) return;
			room.finishedAt = new Date(finishedAt);
		});
		this.broadcastMessage("game_finished", this.getLatestState());
		for (const socketUsername in this.sockets) {
			if (this.sockets[socketUsername] == null) {
				return;
			}
			this.removeSocket(socketUsername);
		}
	}

	async getRandomPlayers() {
		const playerIDs = this.roomData?.list.playerIDs.split(",");
		if (!playerIDs?.length) throw new ApiError("Game list not found", 404);
		const randomArr = getRandomItemsFromArray(
			playerIDs,
			this.roomData!.levels
		).map((num) => num.toString());
		const players = await this.db
			.select()
			.from(schema.player)
			.where(inArray(schema.player.id, randomArr));

		if (players == null || !players.length) {
			throw new ApiError("Couldn't get valid players", 500);
		}
		return players;
	}

	async scheduleNextRound(roomID: string) {
		if (this.gameState.progress == null || !this.players) return;
		// Check if new round is available
		if (this.gameState.progress.currentLevel >= this.roomData!.levels) {
			return this.finishGame(roomID);
		}
		await this.setGameState(
			produce(this.gameState, (state) => {
				if (state.progress == null) return;
				state.progress = {
					currentLevel: state.progress.currentLevel + 1,
					currentPlayer: JSON.stringify(
						this.players![state.progress.currentLevel + 1].data
					),
					currentLevelStartedAt: Date.now(),
				};
			})
		);
		this.broadcastMessage("new_round", this.getLatestState());
		setTimeout(() => {
			this.scheduleNextRound(roomID);
		}, this.roomData!.durationBetweenLevels * 1000);
	}

	getLatestState() {
		return {
			roomState: this.roomData,
			gameState: produce(this.gameState, (state) => {
				const currentPlayer = state.progress?.currentPlayer;
				if (currentPlayer == null) return;
				const parsedData = JSON.parse(currentPlayer);
				parsedData.playerName = mutateString(parsedData.playerName, "*");
				state.progress!.currentPlayer = parsedData;
			}),
			activeUsers: Object.getOwnPropertyNames(this.sockets),
		};
	}

	async setPlayers(players: Awaited<ReturnType<typeof this.getRandomPlayers>>) {
		await retry(() => this.storage.put("players", players), 2);
		this.players = players;
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
		if (this.roomData == null || this.roomData.startedAt != null) return;
		await Promise.all([
			this.db
				.update(room)
				.set({ currentSize: sql`${room.currentSize} - 1` })
				.where(and(eq(room.id, this.roomData.id), gt(room.currentSize, 0))),
			this.setGameState(
				produce(this.gameState, (game) => {
					game.users = game.users.filter((user) => !users.includes(user));
					for (const key of users) {
						delete game.usersProgress[key];
					}
				})
			),
		]);
		this.roomData = produce(this.roomData, (room) => {
			if (room == null || room.currentSize === 0) return;
			room.currentSize--;
		});
	}

	async persistUser(username: string, roomID: string) {
		if (this.gameState.users.includes(username)) {
			return;
		}
		const newGameState = produce(this.gameState, (state) => {
			state.users.push(username);
			state.usersProgress[username] = { points: 0, answers: [] };
		});
		await this.setGameState(newGameState);
		// Start game only if size is reached
		if (this.roomData == null || this.roomData.currentSize < this.roomData.size)
			return;
		await retry(() => this.startGame(roomID), 2);
	}

	async webSocketMessage(ws: WebSocket, message: ArrayBuffer | string) {
		const username = ws.deserializeAttachment();
		// Check if game started, user is known and hasn't gave right answer before
		if (
			message === "ping" ||
			this.gameState.progress == null ||
			this.gameState.usersProgress[username] == null ||
			this.gameState.usersProgress[username].answers.some(
				(answer) => answer.level === this.gameState.progress!.currentLevel
			)
		)
			return;
		const { answer } = JSON.parse(message.toString());
		const corrections = compareStrings(
			JSON.parse(this.gameState.progress.currentPlayer).playerName,
			answer
		);
		if (corrections != null) {
			return this.sendMessage("wrong_answer", { corrections }, username);
		} else {
			const timePassed =
				Date.now() - this.gameState.progress.currentLevelStartedAt;
			const points = Math.floor(
				maxPointsPerLevel *
					(1 - timePassed / (this.roomData!.durationBetweenLevels * 1000))
			);
			await this.setGameState(
				produce(this.gameState, (state) => {
					state.usersProgress[username].answers.push({
						level: state.progress!.currentLevel,
						timestamp: Date.now(),
					});
					state.usersProgress[username].points += points;
				})
			);
			this.sendMessage("correct_answer", {}, username);
			return this.broadcastMessage("new_correct_answer", this.getLatestState());
		}
	}

	async dropUsers(usernames: string[]) {
		usernames.forEach((username) => this.removeSocket(username, false));
		await this.state.blockConcurrencyWhile(
			this.deleteUsersFromStorage.bind(this, usernames)
		);
	}

	async webSocketClose(ws: WebSocket) {
		const username: string = ws.deserializeAttachment();
		this.dropUsers([username]);
		this.broadcastMessage("user_dropped", this.getLatestState());
	}

	websocketError(ws: WebSocket) {
		const username = ws.deserializeAttachment();
		this.sendMessage("error_occured", {}, username);
	}
}
