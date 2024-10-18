import { Hono } from "hono";
import { CustomEnvironment } from "../types";
import { asset } from "../db/schemas";
import { and, count, eq, gte } from "drizzle-orm";
import { nanoid } from "nanoid";
import { ApiError } from "../utils/error";

const assetRouter = new Hono<CustomEnvironment>();

assetRouter.post("/", async (c) => {
	const ipAddress = c.req.header("CF-Connecting-IP") ?? "unknown";
	const now = new Date();
	const oneMinuteAgo = new Date(now.getTime() - 10 * 60 * 1000);
	const userAssets = await c
		.get("db")
		.select({ count: count() })
		.from(asset)
		.where(
			and(eq(asset.ipAddress, ipAddress), gte(asset.createdAt, oneMinuteAgo))
		);
	if (!userAssets[0] || userAssets[0].count >= 10) {
		throw new ApiError(
			"Cannot upload more than 10 images in last 10 minutes",
			400
		);
	}
	const body = await c.req.parseBody();
	if (
		!(body["file"] instanceof File) ||
		!["image/png", "image/jpg", "image/jpeg", "image/webp"].includes(
			body["file"].type
		)
	) {
		throw new ApiError(
			"Image with format of png, jpg, jpeg or webp and with size less than 3mb is expected"
		);
	}
	const filename = nanoid(32) + "." + body["file"].type.replace("image/", "");
	await Promise.all([
		c.env.R2_STORAGE.put(filename, body["file"]),
		c.get("db").insert(asset).values({ key: filename, ipAddress }),
	]);
	return c.json({ filename });
});

assetRouter.get("/r2/:key", async (c) => {
	if (c.env.ENVIRONMENT !== "development")
		return new Response(undefined, { status: 404 });
	const key = c.req.param("key");
	const file = await c.env.R2_STORAGE.get(key);
	if (!file) throw new ApiError("File not found", 404);
	const headers = new Headers();
	headers.append("etag", file.httpEtag);
	return new Response(file.body, {
		headers,
	});
});

export default assetRouter;
