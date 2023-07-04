import { IncomingMessage } from "http";
import stream from "stream";
import ws from "ws";

type UpgradeHandler = (
  req: InstanceType<typeof IncomingMessage>,
  socket: stream.Duplex,
  head: Buffer
) => void;

const JoinRoomURL = "/arena/join/";

function handleError(
  socket: Parameters<UpgradeHandler>[1],
  message = "Error occured"
) {
  socket.destroy(new Error(message));
}

const handleRoomWS: UpgradeHandler = (req, socket, head) => {
  if (req.url == null) {
    return handleError(socket, "Invalid url");
  }
  const { pathname } = new URL(req.url);
  if (!pathname.startsWith(JoinRoomURL)) {
    return handleError(socket, `Cannot connect to ${pathname ?? "given URL"}`);
  }
  const idString = pathname.replace(JoinRoomURL, "");
  const roomID = Number(idString);
  if (idString.trim() === "" || Number.isNaN(roomID)) {
    return handleError(socket, "Room not found");
  }
  const wss = new ws.Server({ noServer: true });
  wss.handleUpgrade(req, socket, head, function done(ws) {
    wss.emit("connection", ws, req);
  });
};

export default handleRoomWS;
