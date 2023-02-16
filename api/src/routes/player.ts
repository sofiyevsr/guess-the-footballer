import { Hono } from "hono";
import type { CustomEnvironment } from "../types";
import { difficultyMappings, playerCount } from "../utils/constants";
import { customCache } from "../utils/middlewares/customCache";
import { generateRandomArray } from "../utils/random";
import { compareStrings, mutateString } from "../utils/string";
import { answerSchema } from "../utils/validation/answer";

const playerRouter = new Hono<CustomEnvironment>();

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
	const randomArr = generateRandomArray(10, [1, maxRange]);
	const promises = randomArr.map((id) => c.env.PLAYERSKV.get(`player:${id}`));
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
	const result = await c.env.PLAYERSKV.get("challenge");
	if (result == null) {
		return c.notFound();
	}
	const parsedData = JSON.parse(result);
	parsedData.playerName = mutateString(parsedData.playerName, "*");
	delete parsedData.foreignID;
	return c.json(parsedData);
});

playerRouter.post("/answer/:id{[0-9]+}", async (c) => {
	const id = c.req.param("id");
	const player = await c.env.PLAYERSKV.get(`player:${id}`);
	if (player == null) {
		return c.notFound();
	}
	const { playerName } = JSON.parse(player);

	const body = await c.req.json();
	const { answer } = answerSchema.parse(body);
	const corrections = compareStrings(playerName, answer);

	return c.json({ corrections });
});

export default playerRouter;
