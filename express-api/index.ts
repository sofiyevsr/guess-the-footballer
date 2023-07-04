import { config } from "dotenv";
import app from "app";
import startup from "startup";
import handleRoomWS from "ws/room";

config();

const port = process.env.PORT || 3000;

startup(app)
  .then(() => {
    const server = app.listen(port, () => {
      console.log("Server running on %s", port);
    });
    server.on("upgrade", handleRoomWS);
  })
  .catch((e) => {
    console.error("Failed to start server\n %s", e);
    process.exit(1);
  });
