import { Hono } from "hono";
import db from "../storage/db";
import { CustomEnvironment } from "../types";
import { roomSchema } from "../utils/validation/room";

const multiplayerRouter = new Hono<CustomEnvironment>();

multiplayerRouter.get("/rooms", async (c) => {
  const result = await db(c).execute(
    "select * from Room",
  );
  return c.json({ rows: result.rows });
});

multiplayerRouter.post("/rooms", async (c) => {
  const body = await c.req.json();
  const { size, private: nonPublic } = roomSchema.parse(body);
  const roomID = c.env.ARENA_ROOM_DO.newUniqueId();
  const id = roomID.toString();
  await db(c).execute(
    "INSERT INTO Room(id, private, size) VALUES(:id, :private, :size)",
    { id, private: nonPublic, size }
  );
  return c.json({ id });
});

multiplayerRouter.get("/", (c) => {
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
