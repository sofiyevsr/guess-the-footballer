import { Hono } from "hono";
import { ZodError } from "zod";
import routes from "./routes";
import { scheduled } from "./scheduler";
import { CustomEnvironment } from "./types";
import { cors } from "./utils/middlewares/customCors";
import { runInDev } from "./utils/misc/runInDev";

const app = new Hono<CustomEnvironment>();

app.use("*", cors);

app.route("/health", routes.healthRouter);
app.route("/player", routes.playerRouter);
app.route("/arena", routes.multiplayerRouter);
app.route("/session", routes.sessionRouter);

app.onError((error, c) => {
	runInDev(c.env, () => {
		console.log(
			`Following error occured: ${error.message}, stack: ${error.stack}`
		);
	});
	if (error instanceof ZodError && error.issues.length > 0) {
		return c.json({ error: error.issues[0].message }, 400);
	}
	return c.json({ error: "Unexpected error" }, 500);
});

app.notFound((c) => {
	return c.json({ error: "Not found" }, 404);
});

export { ArenaRoom } from "./storage/room.do";

export default {
	fetch: app.fetch,
	scheduled,
};
