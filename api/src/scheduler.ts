import { Env } from "./types";

// TODO Today's challenge
export function scheduled(
  event: ScheduledEvent,
  _: Env,
  ctx: ExecutionContext
) {
  ctx.waitUntil(
    (async function () {
      console.log("event: " + JSON.stringify(event));
    })()
  );
}
