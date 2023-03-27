import { Context } from "hono";
import { StatusCode } from "hono/utils/http-status";
import { handleWebSocketError } from "./websocket";

const connectionTypes = ["http", "ws"] as const;
export type ConnectionType = (typeof connectionTypes)[number];

type Options = {
	skipHeaderCheckWS?: boolean;
	httpStatus?: StatusCode;
};

export function compatErrorResponse(
	c: Context,
	type: ConnectionType,
	reason: string,
	options?: Options
): Response {
	if (type === "http") return c.json({ error: reason }, options?.httpStatus);
	return handleWebSocketError(c, reason, options?.skipHeaderCheckWS);
}
