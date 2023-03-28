import { Context, Hono } from "hono";
import type { CustomEnvironment, DatabaseRoom } from "../types";
import { defaultPaginationLimit } from "../utils/constants";
import { session } from "../utils/middlewares/session";
import { handleWebSocketError } from "../utils/misc/websocket";
import { cast } from "../utils/transform/cast";
import { roomSchema } from "../utils/validation/room";
import { cursorValidator, roomIdValidator } from "../utils/validation/utils";

const multiplayerRouter = new Hono<CustomEnvironment>();

multiplayerRouter.get("/rooms", async (c) => {
	const cursor = cursorValidator.parse(c.req.query("cursor"));
	const { statement, binds } =
		cursor == null || cursor === 0
			? { statement: "", binds: [defaultPaginationLimit + 1] }
			: {
					statement: "AND created_at < ?",
					binds: [cursor, defaultPaginationLimit + 1],
			  };
	const { results } = await c.env.__D1_BETA__ARENA_DB
		.prepare(
			`SELECT id, creator_username, private, size, current_size, difficulty, started_at, finished_at, created_at
       FROM room WHERE private = 0 AND current_size < size AND started_at IS NULL ${statement}
       ORDER BY created_at DESC LIMIT ?`
		)
		.bind(...binds)
		.all<DatabaseRoom>();
	if (results == null) {
		return c.json({ error: "error_occured" }, 500);
	}
	const response: { rooms: DatabaseRoom[]; cursor?: number } = {
		rooms: results,
	};
	if (results.length === defaultPaginationLimit + 1) {
		response.rooms = response.rooms.slice(0, -1);
		response.cursor = response.rooms[response.rooms.length - 1].created_at;
	}
	return c.json(response);
});

multiplayerRouter.get("/my-rooms", session(), async (c) => {
	const cursor = cursorValidator.parse(c.req.query("cursor"));
	const { statement, binds } =
		cursor == null || cursor === 0
			? {
					statement: "",
					binds: [c.get("user")!.username, defaultPaginationLimit + 1],
			  }
			: {
					statement: "AND created_at < ?",
					binds: [c.get("user")!.username, cursor, defaultPaginationLimit + 1],
			  };
	const { results } = await c.env.__D1_BETA__ARENA_DB
		.prepare(
			`SELECT id, creator_username, private, size, current_size, difficulty, started_at, finished_at, created_at
       FROM room WHERE creator_username = ? ${statement}
       ORDER BY created_at DESC LIMIT ?`
		)
		.bind(...binds)
		.all<DatabaseRoom>();
	if (results == null) {
		return c.json({ error: "error_occured" }, 500);
	}
	const response: { rooms: DatabaseRoom[]; cursor?: number } = {
		rooms: results,
	};
	if (results.length === defaultPaginationLimit + 1) {
		response.rooms = response.rooms.slice(0, -1);
		response.cursor = response.rooms[response.rooms.length - 1].created_at;
	}
	return c.json(response);
});

multiplayerRouter.post("/rooms", session(), async (c) => {
	const body = await c.req.json();
	const { size, private: nonPublic, difficulty } = roomSchema.parse(body);
	const roomID = c.env.ARENA_ROOM_DO.newUniqueId();
	const id = roomID.toString();
	const stm = c.env.__D1_BETA__ARENA_DB
		.prepare(
			`INSERT INTO room(id, creator_username, private, size, difficulty, created_at, current_size)
       VALUES(?, ?, ?, ?, ?, ?, 0)
       RETURNING id, creator_username, private, size, current_size, difficulty, started_at, finished_at, created_at`
		)
		.bind(
			id,
			c.get("user")!.username,
			cast(nonPublic),
			size,
			difficulty,
			Date.now()
		);
	const room = await stm.first();
	return c.json({ room });
});

multiplayerRouter.get("/join/:id", session("ws"), async (c) => {
	const upgradeHeader = c.req.headers.get("Upgrade");
	if (upgradeHeader !== "websocket") {
		return c.json({ error: "Expected websocket connection" }, 426);
	}
	const roomID = roomIdValidator.parse(c.req.param("id"));
	const roomData = await c.env.__D1_BETA__ARENA_DB
		.prepare(`SELECT id FROM room WHERE id = ?`)
		.bind(roomID)
		.first<{ id: number } | null>();
	if (roomData == null) {
		return handleWebSocketError(c as Context, "Room not found");
	}
	const roomDoID = c.env.ARENA_ROOM_DO.idFromName(roomID);
	const roomDo = c.env.ARENA_ROOM_DO.get(roomDoID);
	const url = new URL(c.req.url);
	url.searchParams.append("username", c.get("user")!.username);
	const { webSocket, status } = await roomDo.fetch(url);
	return new Response(null, {
		status,
		webSocket,
		headers: c.res.headers,
	});
});

export default multiplayerRouter;
