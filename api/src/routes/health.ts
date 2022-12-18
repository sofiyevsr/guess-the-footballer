import { Hono } from "hono";
import { CustomEnvironment } from "../types";

const healthRouter = new Hono<CustomEnvironment>();

healthRouter.get("/", (c) => {
  return c.json({ status: "ready" });
});

healthRouter.get("/seed/date", (c) => {
  const filename = c.env.PLAYERS_FILENAME;
  if (filename == null) return c.notFound();
  const timestamp = filename.replace(/\D/g, "");
  const date = Number(timestamp);
  if (Number.isNaN(date)) {
    return c.notFound();
  }
  return c.json({ date });
});

export default healthRouter;
