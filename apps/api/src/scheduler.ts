import { getDB } from "./db";
import { Env } from "./types";
import { dailyChallenge, gameList, player } from "./db/schemas/index";
import { getRandomNumber } from "./utils/random";
import { retry } from "./utils/retry";
import { eq } from "drizzle-orm";
import { ApiError } from "./utils/error";

async function handleEvent(_: ScheduledEvent, env: Env) {
	const db = getDB(env.ARENA_DB);
	const top100List = await db.query.gameList.findFirst({
		where: eq(gameList.id, "top100"),
	});
	if (top100List == null) return;
	const playerIDs = top100List.playerIDs.split(",");
	if (!playerIDs.length) return;
	const randomIndex = getRandomNumber([1, playerIDs.length]);
	const singlePlayer = await db.query.player.findFirst({
		where: eq(player.id, playerIDs[randomIndex]),
	});
	if (singlePlayer == null) {
		throw new ApiError("Couldn't get a valid player");
	}
	await db.insert(dailyChallenge).values({ playerID: singlePlayer.id });
}

export function scheduled(
	event: ScheduledEvent,
	env: Env,
	ctx: ExecutionContext
) {
	ctx.waitUntil(retry(handleEvent.bind(undefined, event, env), 3));
}
