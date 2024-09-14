import { Hono } from "hono";
import type { CustomEnvironment } from "../types";
import { compareStrings, mutateString } from "../utils/string";
import { answerSchema } from "../utils/validation/answer";
import { dailyChallenge, gameList, player } from "../db/schemas";
import { eq, inArray, and, lte, gte, asc } from "drizzle-orm";
import { getRandomItemsFromArray } from "../utils/random";
import { zValidator } from "@hono/zod-validator";
import { gameListParamsSchema } from "../utils/validation/gameList";
import { idValidator, numberIdValidator } from "../utils/validation/utils";
import { getMonthRange } from "../utils/misc/date";
import { monthRangeSchema } from "../utils/validation/challenge";
import { ApiError } from "../utils/error";

const playerRouter = new Hono<CustomEnvironment>();

playerRouter.get("/", zValidator("query", gameListParamsSchema), async (c) => {
	const { rounds, listID } = c.req.valid("query");
	const list = await c.get("db").query.gameList.findFirst({
		where: eq(gameList.id, listID),
	});
	const playerIDs = list?.playerIDs.split(",");
	if (!playerIDs?.length) throw new ApiError("Game list not found", 404);
	const randomArr = getRandomItemsFromArray(playerIDs, rounds).map((num) =>
		num.toString()
	);
	const players = await c
		.get("db")
		.select()
		.from(player)
		.where(inArray(player.id, randomArr));
	for (let i = 0, len = players.length; i < len; i++) {
		const { data } = players[i];
		data.playerName = mutateString(data.playerName, "*");
		players[i].data = data;
	}
	return c.json(players);
});

playerRouter.get(
	"/challenges",
	zValidator("query", monthRangeSchema),
	async (c) => {
		const now = new Date();
		const input = c.req.valid("query");
		const [rangeStart, rangeEnd] = getMonthRange({
			year: input?.year ?? now.getUTCFullYear(),
			month: input?.month ?? now.getUTCMonth(),
		});
		// TODO rethink dates with dayjs in UTC
		const challenges = await c.get("db").query.dailyChallenge.findMany({
			orderBy: asc(dailyChallenge.createdAt),
			where: and(
				lte(dailyChallenge.createdAt, rangeEnd),
				gte(dailyChallenge.createdAt, rangeStart)
			),
		});
		return c.json(challenges);
	}
);

playerRouter.get(
	"/challenge/:id",
	zValidator("param", numberIdValidator),
	async (c) => {
		const { id } = c.req.valid("param");
		const challenge = await c.get("db").query.dailyChallenge.findFirst({
			where: eq(dailyChallenge.id, id),
			with: { player: true },
		});
		if (challenge == null) {
			return c.notFound();
		}
		const { data } = challenge.player;
		data.playerName = mutateString(data.playerName, "*");
		return c.json(data);
	}
);

playerRouter.post(
	"/answer/:id{[0-9]+}",
	zValidator("param", idValidator),
	zValidator("json", answerSchema),
	async (c) => {
		const { id } = c.req.valid("param");
		const singlePlayer = await c
			.get("db")
			.query.player.findFirst({ where: eq(player.id, id) });
		if (singlePlayer == null) {
			return c.notFound();
		}
		const { playerName } = singlePlayer.data;

		const { answer } = c.req.valid("json");
		const corrections = compareStrings(playerName, answer);

		return c.json({ corrections });
	}
);

export default playerRouter;
