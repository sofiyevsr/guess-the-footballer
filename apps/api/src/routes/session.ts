import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { CustomEnvironment } from "../types";
import { session } from "../utils/middlewares/session";
import { session as dbSession } from "../db/schemas";
import { setTokenCookie } from "../utils/misc/session";
import { sessionSchema } from "../utils/validation/session";

const sessionRouter = new Hono<CustomEnvironment>();

sessionRouter.get("/me", session(), async (c) => {
	const user = c.get("user");
	return c.json(user);
});

sessionRouter.get("/check-username", async (c) => {
	const username = sessionSchema.shape.username.parse(c.req.query("username"));
	const row = await c.get("db").query.session.findFirst({
		columns: { username: true },
		where: eq(dbSession.username, username),
	});

	return c.json({ available: row == null }, 200);
});

sessionRouter.post("/", async (c) => {
	const body = await c.req.json();
	const { username } = sessionSchema.parse(body);
	const token = nanoid(32);
	const [firstSession] = await c
		.get("db")
		.insert(dbSession)
		.values({
			username,
			token,
		})
		.returning();

	setTokenCookie(c, token);
	return c.json(firstSession, 201);
});

export default sessionRouter;
