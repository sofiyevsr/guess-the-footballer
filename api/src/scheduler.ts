import { Env } from "./types";
import { playerCount } from "./utils/constants";
import { getRandomNumber } from "./utils/random";
import { retry } from "./utils/retry";

async function handleEvent(_: ScheduledEvent, env: Env) {
	const randomID = getRandomNumber([1, playerCount]);
	const player = await env.PLAYERSKV.get(randomID.toString());
	if (player == null) {
		throw Error("Couldn't get a valid player");
	}
	await env.PLAYERSKV.put("challenge", player);
  await caches.default.delete(`${env.WEB_URL}/player/challenge`);
}

export function scheduled(
	event: ScheduledEvent,
	env: Env,
	ctx: ExecutionContext
) {
	ctx.waitUntil(retry(handleEvent.bind(undefined, event, env), 3));
}
