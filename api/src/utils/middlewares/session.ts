import { MiddlewareHandler } from "hono";
import { CustomEnvironment } from "../../types";
import { parseTokenFromHeader } from "../misc/session";

export const session: MiddlewareHandler<string, CustomEnvironment> = async (
	c,
	next
) => {
	const authHeader = c.req.header("Authorization");
	const token = parseTokenFromHeader(authHeader);
	if (token == null) {
		return c.json({}, 401);
	}
	const result = await c.env.__D1_BETA__ARENA_DB
		.prepare("SELECT username, created_at FROM session WHERE token = ?")
		.bind(token)
		.first();
	if (result == null) {
		return c.json({}, 401);
	}
	c.set("user", result);
	await next();
};
