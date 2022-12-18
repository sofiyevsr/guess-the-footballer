import type { MiddlewareHandler } from "hono";
import type { CustomEnvironment } from "../../types";

export const cors: MiddlewareHandler<string, CustomEnvironment> = async (
	c,
	next
) => {
	const options = {
		origin: c.env.ORIGIN,
		allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
	};
	c.res.headers.append("Access-Control-Allow-Origin", options["origin"]);
	c.res.headers.append("Access-Control-Allow-Credentials", "true");
	c.res.headers.append("Vary", "Origin");

	if (c.req.method !== "OPTIONS") {
		return await next();
	}
	// Preflight
	c.res.headers.append(
		"Access-Control-Allow-Methods",
		options.allowMethods.join(",")
	);

	c.res.headers.delete("Content-Length");
	c.res.headers.delete("Content-Type");

	c.res = new Response(null, {
		headers: c.res.headers,
		status: 204,
		statusText: c.res.statusText,
	});
};
