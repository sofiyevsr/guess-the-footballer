import type { MiddlewareHandler, Context, Next } from "hono";
import type { CustomEnvironment } from "../../types";

interface Options {
	duration?: number;
	keepQueries?: boolean;
}

export function customCache({
	duration = 10,
	keepQueries = true,
}: Options): MiddlewareHandler<string, CustomEnvironment> {
	return async (c: Context<string, CustomEnvironment>, next: Next) => {
		let key = c.req.url;
		if (keepQueries === false) {
			key = c.req.url.split("?")[0];
		}
		const cache = caches.default;
		const response = await cache.match(key);
		if (response != null && response.ok === true) {
			// Strip cache header to not send it client browser
			const responseClone = response.clone();
			responseClone.headers.delete("Cache-Control");
			return responseClone;
		}
		await next();
		const responseClone = c.res.clone();
		responseClone.headers.append("Cache-Control", `max-age=${duration * 60}`);
		c.executionCtx.waitUntil(cache.put(key, responseClone));
	};
}
