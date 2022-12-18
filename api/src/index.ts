import { Hono } from "hono";
import routes from "./routes";
import { scheduled } from "./scheduler";
import { CustomEnvironment, Env } from "./types";

const app = new Hono<CustomEnvironment>();

app.route("/player", routes.playerRouter);
app.route("/arena", routes.multiplayerRouter);

export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext) {
		return app.fetch(request, env, ctx);
	},
	scheduled,
};
