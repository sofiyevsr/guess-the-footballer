import { Hono } from "hono";
import { nanoid } from "nanoid";
import { CustomEnvironment } from "../types";
import { session } from "../utils/middlewares/session";
import { setTokenCookie } from "../utils/misc/session";
import { sessionSchema } from "../utils/validation/session";

const sessionRouter = new Hono<CustomEnvironment>();

sessionRouter.get("/me", session(), async (c) => {
	const user = c.get("user");
	return c.json(user);
});

sessionRouter.get("/check-username", async (c) => {
	const username = sessionSchema.shape.username.parse(c.req.query("username"));
	const result = await c.env.ARENA_DB
		.prepare("SELECT username, created_at FROM session WHERE username = ?")
		.bind(username)
		.first();

	return c.json({ available: result == null }, 200);
});

sessionRouter.post("/", async (c) => {
	const body = await c.req.json();
	const { username } = sessionSchema.parse(body);
	const token = nanoid(32);
	const now = Date.now();
	const stm = c.env.ARENA_DB
		.prepare("INSERT INTO session(username, token, created_at) VALUES(?, ?, ?)")
		.bind(username, token, now);
	await stm.run();
	setTokenCookie(c, token);
	return c.json({ token, username, created_at: now }, 201);
});

export default sessionRouter;
