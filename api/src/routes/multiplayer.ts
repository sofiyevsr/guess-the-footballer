import { Hono } from "hono";
import { CustomEnvironment } from "../types";

const multiplayerRouter = new Hono<CustomEnvironment>();

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
