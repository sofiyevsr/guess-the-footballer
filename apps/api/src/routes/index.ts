import multiplayerRouter from "./multiplayer";
import playerRouter from "./player";
import sessionRouter from "./session";
import healthRouter from "./health";
import telegramRouter from "./telegram";
import gameListRouter from "./gameList";
import assetRouter from "./asset";

const routes = {
	healthRouter,
	sessionRouter,
	gameListRouter,
	multiplayerRouter,
	playerRouter,
	telegramRouter,
	assetRouter,
};

export default routes;
