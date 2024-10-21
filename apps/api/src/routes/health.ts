import { Hono } from "hono";
import { CustomEnvironment } from "../types";

const healthRouter = new Hono<CustomEnvironment>();

healthRouter.get("/", (c) => {
	return c.json({ status: "ready" });
});

export default healthRouter;
