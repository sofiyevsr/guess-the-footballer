import { MiddlewareHandler } from "hono";
import { CustomEnvironment } from "../../types";
import { handleWebSocketError } from "../misc/websocket";

export const session: MiddlewareHandler<string, CustomEnvironment> = async (
	c,
	next
) => {
	const token = c.req.cookie("token");
	if (token == null) {
		return handleWebSocketError(c, "Session token not found");
	}
	const result = await c.env.__D1_BETA__ARENA_DB
		.prepare("SELECT username, created_at FROM session WHERE token = ?")
		.bind(token)
		.first();
	if (result == null) {
		return handleWebSocketError(c, "Session not found");
	}
	c.set("user", result);
	return next();
};
