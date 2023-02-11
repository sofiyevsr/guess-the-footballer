import { Hono } from "hono";
import { CustomEnvironment } from "../types";
import { session } from "../utils/middlewares/session";
import { cast } from "../utils/transform/cast";
import { roomSchema } from "../utils/validation/room";

const multiplayerRouter = new Hono<CustomEnvironment>();

multiplayerRouter.get("/rooms", async (c) => {
  const result = await c.env.__D1_BETA__ARENA_DB
    .prepare("select * from room")
    .all();
  return c.json(result);
});

multiplayerRouter.post("/rooms", session, async (c) => {
  const body = await c.req.json();
  const { size, private: nonPublic } = roomSchema.parse(body);
  const roomID = c.env.ARENA_ROOM_DO.newUniqueId();
  const id = roomID.toString();
  const stm = c.env.__D1_BETA__ARENA_DB
    .prepare(
      "INSERT INTO room(id, private, size, created_at) VALUES(?, ?, ?, ?)"
    )
    .bind(id, cast(nonPublic), size, new Date().toISOString());
  await stm.run();
  return c.json({ id });
});

multiplayerRouter.get("/", session, (c) => {
  const upgradeHeader = c.req.headers.get("Upgrade");
  if (upgradeHeader !== "websocket") {
    return c.body("Expected Upgrade: websocket", 426);
  }
  const webSocketPair = new WebSocketPair();
  const client = webSocketPair[0],
    server = webSocketPair[1];

  server.accept();
  server.addEventListener("message", (event) => {
    console.log("message:" + event.data);
    server.send("Hello");
  });
  server.addEventListener("error", (event) => {
    console.log("error:" + event.error);
  });
  server.addEventListener("close", (event) => {
    console.log("closed:" + event.reason);
  });

  return new Response(null, {
    status: 101,
    webSocket: client,
  });
});

export default multiplayerRouter;
