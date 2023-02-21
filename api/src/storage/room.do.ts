import { Hono } from "hono";
import { produce } from "immer";
import { DatabaseRoom, Env } from "../types";

const PAYLOADTYPES = [
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

export class ArenaRoom {
	private env: Env;
	private state: DurableObjectState;
	private storage: DurableObjectStorage;
	private sockets: { [K in string]: WebSocket } = {};
	// This variable should hold latest state ideally
	private gameState: GameState = defaultGameState;
	private router = new Hono();
	constructor(state: DurableObjectState, env: Env) {
		this.state = state;
		this.env = env;
		this.storage = state.storage;
		this.registerRoutes();
		state.blockConcurrencyWhile(this.initGame.bind(this));
	}
	async initGame() {
		const currentGame = await this.storage.get<string>("game");
		if (currentGame == null) {
			return;
		}
		try {
			this.gameState = JSON.parse(currentGame);
		} catch (error) {
			// Probably corrupt data
			await this.storage.delete("game");
		}
	}
	async setGameState(state: GameState) {
		// TODO May be add retry
		await this.storage.put("game", state);
		this.gameState = state;
	}
	// Sends message to [username]
	sendMessage(type: MessageType, message: Object, username: string) {
		for (const socketUsername in this.sockets) {
			if (socketUsername === username) {
				this.sockets[socketUsername].send(JSON.stringify({ type, ...message }));
				return;
			}
		}
	}
	// Sends message to everyone except [username]
	broadcastMessage(type: MessageType, message: Object, username?: string) {
		for (const socketUsername in this.sockets) {
			if (socketUsername === username) {
				continue;
			}
			this.sockets[socketUsername].send(JSON.stringify({ type, ...message }));
		}
	}
	closeSocket(username: string) {
		if (
			this.sockets[username] == null ||
			this.sockets[username].readyState === WebSocket.READY_STATE_CLOSED ||
			this.sockets[username].readyState === WebSocket.READY_STATE_CLOSING
		) {
			return;
		}
		this.sockets[username].close();
	}
	saveSocket(username: string, socket: WebSocket) {
		this.closeSocket(username);
		this.sockets[username] = socket;
	}
	removeSocket(username: string) {
		this.closeSocket(username);
		delete this.sockets[username];
	}
	// TODO PRIORITY
	async startGame() {}
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
		await this.setGameState(newGameState);
		// TODO decide if game should start
		if (true) await this.startGame();
	}
	registerRoutes() {
		this.router.get("/arena/join/:id", async (c) => {
			const username = c.req.query("username");
			const roomID = c.req.param("id");
			const roomData = await this.env.__D1_BETA__ARENA_DB
				.prepare(
					`SELECT id, creator_username, private, size, current_size, started_at, finished_at, created_at
           FROM room WHERE id = ?1`
				)
				.bind(c.req.param("id"))
				.first<DatabaseRoom | null>();
			if (roomData == null) {
				return c.notFound();
			}
			const isUserNewcomer = !this.gameState.users.includes(username);
			if (roomData.finished_at != null) {
				return c.json({ error: "Game in the room is finished" }, 500);
			} else if (roomData.current_size >= roomData.size && isUserNewcomer) {
				return c.json({ error: "Room is full" }, 500);
			} else if (roomData.started_at != null && isUserNewcomer) {
				return c.json({ error: "Game already started" }, 403);
			}

			const { 0: client, 1: server } = new WebSocketPair();
			server.accept();
			server.addEventListener("close", () => {
				this.removeSocket(username);
				this.broadcastMessage("user_dropped", { username });
			});
			server.addEventListener("error", (e) => {
				this.sendMessage("error_occured", { error: e.message }, username);
			});
			server.addEventListener("message", (message) => {
				// TODO check if game is active and user hasn't responded yet
				// TODO check if answer is right, update points, then broadcast
				console.log(message);
			});
			if (isUserNewcomer)
				await this.state.blockConcurrencyWhile(
					this.persistUser.bind(this, username, roomID)
				);
			this.saveSocket(username, server);
			// TODO also should send room state
			this.sendMessage("joined_room", this.gameState, username);
			this.broadcastMessage("user_joined", this.gameState, username);

			return new Response(null, { status: 101, webSocket: client });
		});

		this.router.onError((error, c) => {
			console.log(
				`Following error occured: ${error.message}, stack: \n${error.stack}`
			);
			return c.json({ error: "error_occured" }, 500);
		});
	}
	async fetch(request: Request) {
		return this.router.fetch(request);
	}
}
