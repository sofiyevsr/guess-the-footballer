import { Env } from "./types";
import { playerCount } from "./utils/constants";
import { getRandomNumber } from "./utils/random";
import { retry } from "./utils/retry";

async function handleEvent(_: ScheduledEvent, env: Env) {
	let retryCount = 3;
	let randomID = getRandomNumber([1, playerCount]);
	let player = await env.Players.get(`player:${randomID}`);
	while (retryCount > 0 && player == null) {
		randomID = getRandomNumber([1, playerCount]);
		player = await env.Players.get(`player:${randomID}`);
		retryCount--;
	}
	if (player == null) {
		throw Error("Couldn't get a valid player");
	}
	await env.Players.put("challenge", player);
  await caches.default.delete(`${env.URL}/player/challenge`);
}

export function scheduled(
	event: ScheduledEvent,
	env: Env,
	ctx: ExecutionContext
) {
	ctx.waitUntil(retry(handleEvent.bind(undefined, event, env), 3));
}
