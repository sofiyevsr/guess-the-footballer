import { Hono } from "hono";
import { ZodError } from "zod";
import routes from "./routes";
import { scheduled } from "./scheduler";
import { CustomEnvironment } from "./types";

const app = new Hono<CustomEnvironment>();

app.route("/player", routes.playerRouter);
app.route("/arena", routes.multiplayerRouter);

app.onError((error, c) => {
	console.log(`Following error occured: ${error.message}`);
	if (error instanceof ZodError) {
		c.status(400);
		return c.json({ error: error.issues.map(({ message }) => message) });
	}
	c.status(500);
	return c.json({ error: "error_occured" });
});

export default {
	fetch: app.fetch,
	scheduled,
};
