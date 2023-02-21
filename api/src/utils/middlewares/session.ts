import { Context, MiddlewareHandler } from "hono";
import { CustomEnvironment } from "../../types";

export const session: MiddlewareHandler<string, CustomEnvironment> = async (
	c,
	next
) => {
	const token = c.req.cookie("token");
	if (token == null) {
		return handleError(c, "Session token not found");
	}
	const result = await c.env.__D1_BETA__ARENA_DB
		.prepare("SELECT username, created_at FROM session WHERE token = ?")
		.bind(token)
		.first();
	if (result == null) {
		return handleError(c, "Session not found");
	}
	c.set("user", result);
	return await next();
};

function handleError(c: Context, reason?: string) {
	const upgradeHeader = c.req.headers.get("Upgrade");
	if (upgradeHeader !== "websocket") {
		return c.json({ error: reason }, 401);
	}
	const { 0: client, 1: server } = new WebSocketPair();
	server.accept();
	server.close(1011, reason);
	return new Response(null, { status: 101, webSocket: client });
}
