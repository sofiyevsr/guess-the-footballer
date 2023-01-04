import { Hono } from "hono";
import type { CustomEnvironment } from "../types";
import { difficultyMappings, playerCount } from "../utils/constants";
import { customCache } from "../utils/middlewares/customCache";
import { cors } from "../utils/middlewares/customCors";
import { generateRandomArray } from "../utils/random";
import { mutateString } from "../utils/string";

const playerRouter = new Hono<CustomEnvironment>();

playerRouter.use("*", cors);

playerRouter.get("/", customCache({ duration: 5 }), async (c) => {
	let maxRange = playerCount;
	const difficulty = c.req.query("difficulty");
	if (
		typeof difficulty === "string" &&
		difficultyMappings.hasOwnProperty(difficulty)
	) {
		maxRange =
			difficultyMappings[difficulty as keyof typeof difficultyMappings];
	}
	const randomArr = generateRandomArray(20, [1, maxRange]);
	const promises = randomArr.map((id) => c.env.Players.get(`player:${id}`));
	const result = await Promise.all(promises);
	for (let i = 0, len = result.length; i < len; i++) {
		const data = result[i];
		if (data == null) {
			return c.notFound();
		}
		const parsedData = JSON.parse(data);
		parsedData.playerName = mutateString(parsedData.playerName, "*");
		delete parsedData.foreignID;
		result[i] = parsedData;
	}
	return c.json(result);
});

playerRouter.get("/challenge", customCache({ duration: 30 }), async (c) => {
	const result = await c.env.Players.get("challenge");
	if (result == null) {
		return c.notFound();
	}
	const parsedData = JSON.parse(result);
	parsedData.playerName = mutateString(parsedData.playerName, "*");
	delete parsedData.foreignID;
	return c.json(parsedData);
});

// TODO implement
playerRouter.post("/answer/:id{[0-9]+}", async (c) => {
	const id = c.req.param("id");
	return c.json({});
});

export default playerRouter;
