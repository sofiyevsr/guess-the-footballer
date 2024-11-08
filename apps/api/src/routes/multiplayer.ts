import { Context, Hono } from "hono";
import type { CustomEnvironment } from "../types";
import { defaultPaginationLimit } from "../utils/constants";
import { session } from "../utils/middlewares/session";
import { handleWebSocketError } from "../utils/misc/websocket";
import { roomSchema } from "../utils/validation/room";
import { cursorValidator, idValidator } from "../utils/validation/utils";
import { room } from "../db/schemas";
import { and, desc, eq, gte, isNull, lt } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";

const multiplayerRouter = new Hono<CustomEnvironment>();

multiplayerRouter.get(
	"/rooms",
	zValidator("query", cursorValidator),
	async (c) => {
		const thirtyMinutesAgo = new Date(new Date().getTime() - 30 * 60 * 1000);
		const { cursor } = c.req.valid("query");
		const rooms = await c.get("db").query.room.findMany({
			with: {
				list: { columns: { name: true, imageKey: true, official: true } },
			},
			where: and(
				gte(room.createdAt, thirtyMinutesAgo),
				eq(room.private, false),
				lt(room.currentSize, room.size),
				isNull(room.startedAt),
				cursor != null && cursor !== 0
					? lt(room.createdAt, new Date(cursor))
					: undefined
			),
			orderBy: desc(room.createdAt),
			limit: defaultPaginationLimit + 1,
		});
		const response: {
			rooms: typeof rooms;
			cursor?: number;
		} = {
			rooms,
		};
		if (rooms.length === defaultPaginationLimit + 1) {
			response.rooms = response.rooms.slice(0, -1);
			response.cursor =
				response.rooms[response.rooms.length - 1].createdAt.getTime();
		}
		return c.json(response);
	}
);

multiplayerRouter.get(
	"/my-rooms",
	session(),
	zValidator("query", cursorValidator),
	async (c) => {
		const { cursor } = c.req.valid("query");
		const rooms = await c.get("db").query.room.findMany({
			with: {
				list: { columns: { name: true, imageKey: true, official: true } },
			},
			where: and(
				eq(room.creatorUsername, c.get("user")!.username),
				cursor != null && cursor !== 0
					? lt(room.createdAt, new Date(cursor))
					: undefined
			),
			orderBy: desc(room.createdAt),
			limit: defaultPaginationLimit + 1,
		});
		const response: {
			rooms: typeof rooms;
			cursor?: number;
		} = {
			rooms,
		};
		if (rooms.length === defaultPaginationLimit + 1) {
			response.rooms = response.rooms.slice(0, -1);
			response.cursor =
				response.rooms[response.rooms.length - 1].createdAt.getTime();
		}
		return c.json(response);
	}
);

multiplayerRouter.post("/rooms", session(), async (c) => {
	const body = await c.req.json();
	const {
		tipRevealingInterval,
		durationBetweenLevels,
		levels,
		size,
		private: nonPublic,
		listID,
	} = roomSchema.parse(body);
	const roomID = c.env.ARENA_ROOM_DO.newUniqueId();
	const id = roomID.toString();
	const [newRoom] = await c
		.get("db")
		.insert(room)
		.values({
			id,
			levels,
			durationBetweenLevels,
			tipRevealingInterval,
			creatorUsername: c.get("user")!.username,
			private: nonPublic,
			size,
			currentSize: 0,
			listID,
		})
		.returning();
	return c.json({ room: newRoom });
});

multiplayerRouter.get(
	"/join/:id",
	zValidator("param", idValidator),
	session("ws"),
	async (c) => {
		const upgradeHeader = c.req.header("Upgrade");
		if (upgradeHeader !== "websocket") {
			return c.json({ error: "Expected websocket connection" }, 426);
		}
		const { id: roomID } = c.req.valid("param");
		const roomData = await c.get("db").query.room.findFirst({
			columns: { id: true },
			where: eq(room.id, roomID),
		});
		if (roomData == null) {
			return handleWebSocketError(c as Context, "Room not found");
		}
		const roomDoID = c.env.ARENA_ROOM_DO.idFromName(roomID);
		const roomDo = c.env.ARENA_ROOM_DO.get(roomDoID);
		const url = new URL(c.req.url);
		url.searchParams.append("username", c.get("user")!.username);
		const modifiedRequest = new Request(url, c.req.raw);
		const { webSocket, status } = await roomDo.fetch(modifiedRequest);
		return new Response(null, {
			status,
			webSocket,
		});
	}
);

export default multiplayerRouter;
