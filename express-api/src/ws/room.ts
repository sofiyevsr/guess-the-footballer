import { IncomingMessage } from "http";
import { getSession } from "middlewares/session";
import stream from "stream";
import { WebSocketServer } from "ws";
import cookie from "cookie";

type UpgradeHandler = (
  req: InstanceType<typeof IncomingMessage>,
  socket: stream.Duplex,
  head: Buffer
) => void;

const JoinRoomURL = "/arena/join/";
const wss = new WebSocketServer({ noServer: true });

wss.on("connection", () => {});

const handleRoomWS: UpgradeHandler = async (req, socket, head) => {
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
    return handleError(socket, "Invalid room id");
  }
  if (req.headers.cookie == null) {
    return handleError(socket, "Couldn't get token from cookie");
  }
  const { token } = cookie.parse(req.headers.cookie);
  if (token == null) {
    return handleError(socket, "Token not found");
  }
  const session = await getSession(token);
  if (session == null) {
    return handleError(socket, "Couldn't find session");
  }
  wss.handleUpgrade(req, socket, head, function (ws) {
    wss.emit("connection", ws, req);
  });
};

function handleError(
  socket: Parameters<UpgradeHandler>[1],
  message = "Error occured"
) {
  socket.destroy(new Error(message));
}

export default handleRoomWS;
