import { Hono } from "hono";
import TelegramService from "../services/telegram";
import type { CustomEnvironment } from "../types";
import { zValidator } from "@hono/zod-validator";
import { gameListSchema } from "../utils/validation/gameList";
import { gameList } from "../db/schemas";
import { nanoid } from "nanoid";
import { and, desc, eq, isNotNull, lt, count, sql, gte } from "drizzle-orm";
import { cursorValidator } from "../utils/validation/utils";
import { defaultPaginationLimit } from "../utils/constants";
import { z } from "zod";
import { transfermarktAPI } from "../services/transfermarkt/api";
import { ApiError } from "../utils/error";

const gameListRouter = new Hono<CustomEnvironment>();

gameListRouter.post("/", zValidator("json", gameListSchema), async (c) => {
	const input = c.req.valid("json");
	const ipAddress = c.req.header("CF-Connecting-IP") ?? "unknown";
	const now = new Date();
	const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
	const usersGameLists = await c
		.get("db")
		.select({ count: count() })
		.from(gameList)
		.where(
			and(
				eq(gameList.ipAddress, ipAddress),
				gte(gameList.createdAt, oneHourAgo)
			)
		);
	if (!usersGameLists[0] || usersGameLists[0].count >= 4) {
		throw new ApiError("Cannot submit more than 4 lists in an hour");
	}
	const [newGameList] = await c
		.get("db")
		.insert(gameList)
		.values({
			id: nanoid(),
			name: input.name,
			description: input.description,
			imageKey: input.imageKey,
			official: false,
			ipAddress,
			playerIDs: input.playerIds.join(","),
		})
		.returning({ id: gameList.id, playerIds: gameList.playerIDs });
	const t = new TelegramService(c.env.TELEGRAM_BOT_TOKEN);
	const promises = [
		t.sendMessage(c.env.TELEGRAM_CHAT_ID, JSON.stringify(newGameList)),
		t.sendPhoto(
			c.env.TELEGRAM_CHAT_ID,
			input.name,
			c.env.STORAGE_URL + "/" + input.imageKey
		),
	];
	c.executionCtx.waitUntil(Promise.all(promises));
	return c.json({ gameList: newGameList });
});

gameListRouter.get(
	"/searchPlayer",
	zValidator(
		"query",
		z.object({
			query: z.string({
				invalid_type_error: "Query must be a string",
			}),
		})
	),
	async (c) => {
		const { query } = c.req.valid("query");
		let { players } = await transfermarktAPI.searchPlayer(query);
		players = (players ?? []).map((player) => {
			let club = player.club;
			if (club === "Karriereende") club = "Retired";
			else if (club === "Vereinslos") club = "Free agent";
			return { ...player, club };
		});
		return c.json({ players });
	}
);

gameListRouter.get(
	"/search",
	zValidator(
		"query",
		z.object({
			query: z
				.string({
					invalid_type_error: "Query must be a string",
				})
				.optional(),
		})
	),
	async (c) => {
		const { query } = c.req.valid("query");
		const gameLists = await c.get("db").query.gameList.findMany({
			columns: { ipAddress: false, playerIDs: false, description: false },
			orderBy: (list) => desc(list.official),
			where: (list) =>
				query
					? and(
							sql`lower(${list.name}) like ${"%" + query.toLowerCase() + "%"}`,
							isNotNull(list.approvedAt)
					  )
					: and(isNotNull(list.approvedAt)),
			limit: 20,
		});
		return c.json({ gameLists });
	}
);

gameListRouter.get("/official", async (c) => {
	const gameLists = await c.get("db").query.gameList.findMany({
		columns: { ipAddress: false, playerIDs: false },
		where: and(eq(gameList.official, true), isNotNull(gameList.approvedAt)),
	});
	return c.json({ gameLists });
});

gameListRouter.get(
	"/community",
	zValidator("query", cursorValidator),
	async (c) => {
		const { cursor } = c.req.valid("query");
		const gameLists = await c.get("db").query.gameList.findMany({
			columns: { ipAddress: false, playerIDs: false },
			orderBy: desc(gameList.createdAt),
			where: and(
				isNotNull(gameList.approvedAt),
				eq(gameList.official, false),
				cursor != null && cursor !== 0
					? lt(gameList.createdAt, new Date(cursor))
					: undefined
			),
		});

		const response: {
			gameLists: typeof gameLists;
			cursor?: number;
		} = {
			gameLists,
		};

		if (gameLists.length === defaultPaginationLimit + 1) {
			response.gameLists = response.gameLists.slice(0, -1);
			response.cursor =
				response.gameLists[response.gameLists.length - 1].createdAt.getTime();
		}
		return c.json(response);
	}
);

export default gameListRouter;
