import { Hono } from "hono";
import { ZodError } from "zod";
import routes from "./routes";
import { CustomEnvironment } from "./types";
import { cors } from "./utils/middlewares/customCors";
import { getDB } from "./db";
import { ApiError } from "./utils/error";

const rawApp = new Hono<CustomEnvironment>()
	.use("*", async (c, next) => {
		c.set("db", getDB(c.env.ARENA_DB));
		await next();
	})
	.use("*", cors);

const app = rawApp
	.route("/health", routes.healthRouter)
	.route("/gameList", routes.gameListRouter)
	.route("/player", routes.playerRouter)
	.route("/arena", routes.multiplayerRouter)
	.route("/session", routes.sessionRouter)
	.route("/asset", routes.assetRouter);

// PRIVATE APIs
app.route("/telegram", routes.telegramRouter);

app.onError((error, c) => {
	if (error instanceof ZodError && error.issues.length > 0) {
		return c.json({ error: error.issues[0].message }, 400);
	} else if (error instanceof ApiError) {
		return c.json({ error: error.message }, error.status);
	} else {
		console.log(
			`Following error occured: ${error.message}, stack: ${error.stack}`
		);
	}
	return c.json({ error: "Unexpected error" }, 500);
});

app.notFound((c) => {
	return c.json({ error: "Not found" }, 404);
});

export default app;

export type AppType = typeof app;
