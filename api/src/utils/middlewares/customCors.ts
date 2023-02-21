import type { MiddlewareHandler } from "hono";
import type { CustomEnvironment } from "../../types";

export const cors: MiddlewareHandler<string, CustomEnvironment> = async (
	c,
	next
) => {
  const res = c.res.clone();
	const options = {
		origin: c.env.ORIGIN,
		allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
		allowHeaders: ["Content-Type"],
	};
	res.headers.append("Access-Control-Allow-Origin", options["origin"]);
	res.headers.append("Access-Control-Allow-Credentials", "true");
	res.headers.append(
		"Access-Control-Allow-Headers",
		options["allowHeaders"].join(",")
	);
	res.headers.append("Vary", "Origin");

	if (c.req.method !== "OPTIONS") {
		return await next();
	}
	// Preflight
	res.headers.append(
		"Access-Control-Allow-Methods",
		options.allowMethods.join(",")
	);

	res.headers.delete("Content-Length");
	res.headers.delete("Content-Type");

	c.res = new Response(null, {
		headers: c.res.headers,
		status: 204,
		statusText: c.res.statusText,
	});
	return c.res;
};
