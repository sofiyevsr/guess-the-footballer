import { Hono } from "hono";
import { nanoid } from "nanoid";
import { CustomEnvironment } from "../types";
import { session } from "../utils/middlewares/session";
import { setTokenCookie } from "../utils/misc/session";
import { sessionSchema } from "../utils/validation/session";

const sessionRouter = new Hono<CustomEnvironment>();

sessionRouter.get("/me", session, async (c) => {
	const user = c.get("user");
	return c.json(user);
});

sessionRouter.post("/", async (c) => {
	const body = await c.req.json();
	const { username } = sessionSchema.parse(body);
	const token = nanoid(32);
	const stm = c.env.__D1_BETA__ARENA_DB
		.prepare("INSERT INTO session(username, token, created_at) VALUES(?, ?, ?)")
		.bind(username, token, new Date().toISOString());
	await stm.run();
	setTokenCookie(c, token);
	return c.json({ token }, 201);
});

export default sessionRouter;
