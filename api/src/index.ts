import { Hono } from "hono";
import { ZodError } from "zod";
import routes from "./routes";
import { scheduled } from "./scheduler";
import { CustomEnvironment } from "./types";
import { cors } from "./utils/middlewares/customCors";

const app = new Hono<CustomEnvironment>();

app.use("*", cors);

app.route("/player", routes.playerRouter);
app.route("/arena", routes.multiplayerRouter);
app.route("/session", routes.sessionRouter);

app.onError((error, c) => {
	console.log(`Following error occured: ${error.message}`);
	if (error instanceof ZodError) {
		c.status(400);
		return c.json({ error: error.issues.map(({ message }) => message) });
	}
	return c.json({ error: "error_occured" }, 500);
});

export { ArenaRoom } from "./storage/room.do";

export default {
	fetch: app.fetch,
	scheduled,
};
