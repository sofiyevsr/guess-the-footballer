import { Context } from "hono";

export function handleWebSocketError(
	c: Context,
	reason: string,
	skipHeaderCheck: boolean = true
) {
	if (skipHeaderCheck === false) {
		const upgradeHeader = c.req.header("Upgrade");
		if (upgradeHeader !== "websocket") {
			return c.json({ error: reason }, 426);
		}
	}
	const { 0: client, 1: server } = new WebSocketPair();
	server.accept();
	server.close(1011, reason);
	return new Response(null, {
		status: 101,
		webSocket: client,
		headers: c.res.headers,
	});
}
