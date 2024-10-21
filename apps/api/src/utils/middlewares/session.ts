import { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";
import { CustomEnvironment } from "../../types";
import { compatErrorResponse, ConnectionType } from "../misc/response";

export function session(
	type: ConnectionType = "http"
): MiddlewareHandler<CustomEnvironment> {
	return async (c, next) => {
		const token = getCookie(c, "token");
		if (token == null) {
			return compatErrorResponse(c, type, "Session token not found", {
				skipHeaderCheckWS: false,
				httpStatus: 401,
			});
		}
		const result = await c.get("db").query.session.findFirst({
			columns: {
				username: true,
				createdAt: true,
			},
			where: (session, { eq }) => eq(session.token, token),
		});
		if (result == null) {
			return compatErrorResponse(c, type, "Session not found", {
				skipHeaderCheckWS: false,
				httpStatus: 401,
			});
		}
		c.set("user", result);
		return next();
	};
}
