import { Hono } from "hono";
import { ZodError } from "zod";
import routes from "./routes";
import { scheduled } from "./scheduler";
import { CustomEnvironment } from "./types";

const app = new Hono<CustomEnvironment>();

app.route("/player", routes.playerRouter);
app.route("/arena", routes.multiplayerRouter);
app.route("/session", routes.sessionRouter);

app.onError((error, c) => {
	if (error instanceof ZodError) {
		c.status(400);
		return c.json({ error: error.issues.map(({ message }) => message) });
	} else {
		console.log(
			`Following error occured: ${error.message}, stack: \n${error.stack}`
		);
	}
	c.status(500);
	return c.json({ error: "error_occured" });
});

export { ArenaRoom } from "./storage/room.do";

export default {
	fetch: app.fetch,
	scheduled,
};
