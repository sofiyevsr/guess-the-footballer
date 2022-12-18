import multiplayerRouter from "./multiplayer";
import playerRouter from "./player";
import sessionRouter from "./session";
import healthRouter from "./health";

const routes = { healthRouter, sessionRouter, multiplayerRouter, playerRouter };

export default routes;
