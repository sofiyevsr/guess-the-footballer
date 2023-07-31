import { IncomingMessage } from "http";
import stream from "stream";
import { WebSocketServer, WebSocket } from "ws";
import cookie from "cookie";
import { getSession } from "middlewares/session";
import ArenaRoom from "./arena_room";
import { PromiseOf, eq } from "drizzle-orm";
import { rooms } from "db/schema";
import db from "db";

type UpgradeHandler = (
  req: InstanceType<typeof IncomingMessage>,
  socket: stream.Duplex,
  head: Buffer
) => void;

const roomsMap: { [key: string]: ArenaRoom } = Object.create(null);
const JoinRoomURL = "/arena/join/";
const wss = new WebSocketServer({ noServer: true });

wss.on("connection", async (socket, req) => {
  if (req.url == null) {
    return handleError(socket, "Invalid url");
  }
  const pathname = req.url;
  if (!pathname.startsWith(JoinRoomURL)) {
    return handleError(socket, `Cannot connect to ${pathname ?? "given URL"}`);
  }
  const roomID = pathname.replace(JoinRoomURL, "").trim();
  if (roomID === "") {
    return handleError(socket, "Invalid room ID");
  }
  if (req.headers.cookie == null) {
    return handleError(socket, "Couldn't get token from cookie");
  }
  const { token } = cookie.parse(req.headers.cookie);
  if (token == null) {
    return handleError(socket, "Token not found");
  }
  let session: PromiseOf<ReturnType<typeof getSession>>;
  try {
    session = await getSession(token);
    if (session == null) throw Error();
  } catch (error) {
    return handleError(socket, "Couldn't get session");
  }
  try {
    const [room] = await db
      .select()
      .from(rooms)
      .where(eq(rooms.id, roomID))
      .limit(1);
    if (room == null) throw Error();
    let arenaRoom = roomsMap[roomID];
    if (arenaRoom == null) {
      arenaRoom = new ArenaRoom(roomID, room, () => {
        delete roomsMap[roomID];
      });
      roomsMap[roomID] = arenaRoom;
    }
    arenaRoom.addNewUser(socket, session);
  } catch (_) {
    return handleError(socket, "Couldn't find room");
  }
});

const handleRoomWS: UpgradeHandler = async (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, function (ws) {
    wss.emit("connection", ws, req);
  });
};

function handleError(socket: WebSocket, message = "Error occured") {
  socket.close(1011, message);
}

export default handleRoomWS;
