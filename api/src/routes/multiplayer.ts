import { Hono } from "hono";
import { ArenaRoom } from "../storage/room.do";
import type { CustomEnvironment, DatabaseRoom } from "../types";
import { session } from "../utils/middlewares/session";
import { cast } from "../utils/transform/cast";
import { roomSchema } from "../utils/validation/room";
import { cursorValidator, roomIdValidator } from "../utils/validation/utils";

const multiplayerRouter = new Hono<CustomEnvironment>();

multiplayerRouter.get("/rooms", async (c) => {
	const cursor = cursorValidator.parse(c.req.query("cursor"));
	const { statement, binds } =
		cursor == null
			? { statement: "", binds: [] }
			: { statement: "AND created_at < ?1", binds: [cursor] };
	const { results } = await c.env.__D1_BETA__ARENA_DB
		.prepare(
			`SELECT id, creator_username, size, current_size, created_at
       FROM room WHERE private = 0 AND current_size < size AND started_at IS NULL ${statement}
       ORDER BY created_at DESC LIMIT 20`
		)
		.bind(...binds)
		.all();
	return c.json({ rooms: results });
});

multiplayerRouter.get("/my-rooms", session, async (c) => {
	const cursor = cursorValidator.parse(c.req.query("cursor"));
	const { statement, binds } =
		cursor == null
			? { statement: "", binds: [c.get("user")!.username] }
			: {
					statement: "AND created_at < ?2",
					binds: [c.get("user")!.username, cursor],
			  };
	const { results } = await c.env.__D1_BETA__ARENA_DB
		.prepare(
			`SELECT id, creator_username, private, size, current_size, started_at, finished_at, created_at
       FROM room WHERE creator_username = ?1 ${statement}
       ORDER BY created_at DESC LIMIT 20`
		)
		.bind(...binds)
		.all();
	return c.json({ rooms: results });
});

multiplayerRouter.post("/rooms", session, async (c) => {
	const body = await c.req.json();
	const { size, private: nonPublic } = roomSchema.parse(body);
	const roomID = c.env.ARENA_ROOM_DO.newUniqueId();
	const id = roomID.toString();
	const stm = c.env.__D1_BETA__ARENA_DB
		.prepare(
			"INSERT INTO room(id, creator_username, private, size, created_at, current_size) VALUES(?1, ?2, ?3, ?4, ?5, 0)"
		)
		.bind(id, c.get("user")!.username, cast(nonPublic), size, Date.now());
	await stm.run();
	return c.json({ id });
});

multiplayerRouter.get("/:id", session, async (c) => {
	const upgradeHeader = c.req.headers.get("Upgrade");
	if (upgradeHeader !== "websocket") {
		return c.body("Expected Upgrade: websocket", 426);
	}
	function handleError(reason?: string) {
		const { 0: client, 1: server } = new WebSocketPair();
		server.accept();
		server.close(1011, reason);
		return new Response(null, { status: 101, webSocket: client });
	}
	const roomID = roomIdValidator.parse(c.req.param("id"));
	const roomData = await c.env.__D1_BETA__ARENA_DB
		.prepare(
			`SELECT id, creator_username, private, size, current_size, started_at, finished_at, created_at
       FROM room WHERE id = ?1`
		)
		.bind(roomID)
		.first<DatabaseRoom | null>();
	if (roomData == null) {
		return handleError("Room not found");
	}
	if (roomData.finished_at != null) {
		return handleError("Game in the room ended");
	}
	if (roomData.current_size >= roomData.size) {
		return handleError("Room is full");
	}
  // TODO User can only connect if game is not finished and username is registered OR game hasn't started and there is room
	const roomDoID = c.env.ARENA_ROOM_DO.idFromName(roomID);
	const roomDo = c.env.ARENA_ROOM_DO.get(roomDoID);
	const url = new URL(c.req.url);
	url.searchParams.append("username", c.get("user")!.username);
	return roomDo.fetch(url);
});

export default multiplayerRouter;
