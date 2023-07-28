import { Router } from "express";
import { difficultyMappings, playerCount } from "../utils/constants";
import { generateRandomArray } from "../utils/random";
import { compareStrings, mutateString } from "../utils/string";
import { answerSchema } from "../utils/validation/answer";
import { dailyChallenge, players } from "db/schema";
import { desc, eq, inArray } from "drizzle-orm";
import db from "db";
import { DifficultyType } from "utils/types";

const r = Router();

r.get("/", async (req, res) => {
  let maxRange = playerCount;
  const difficulty = req.query["difficulty"];
  if (
    typeof difficulty === "string" &&
    difficultyMappings.hasOwnProperty(difficulty)
  ) {
    maxRange =
      difficultyMappings[difficulty as DifficultyType];
  }
  const randomArr = generateRandomArray(10, [1, maxRange]);
  const result = await db
    .select()
    .from(players)
    .where(inArray(players.id, randomArr));
  for (let i = 0, len = result.length; i < len; i++) {
    const { value } = result[i];
    const parsedData = JSON.parse(value as string);
    parsedData.playerName = mutateString(parsedData.playerName, "*");
    delete parsedData.foreignID;
    result[i] = parsedData;
  }
  return res.status(200).json(result);
});

r.get("/challenge", async (_, res) => {
  const currentChallenge = await db.query.dailyChallenge.findFirst({
    orderBy: desc(dailyChallenge.id),
    with: {
      player: {
        columns: { value: true },
      },
    },
  });
  if (currentChallenge == null) {
    return res.status(404);
  }
  const parsedData = JSON.parse(currentChallenge.player.value as string);
  parsedData.playerName = mutateString(parsedData.playerName, "*");
  delete parsedData.foreignID;
  return res.status(200).json(parsedData);
});

r.post("/answer/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(404);
  }
  const [player] = await db
    .select({ data: players.value })
    .from(players)
    .where(eq(players.id, id))
    .limit(1);
  if (player == null) {
    return res.status(404);
  }
  const { playerName } = JSON.parse(player.data as string);

  const { answer } = answerSchema.parse(req.body);
  const corrections = compareStrings(playerName, answer);

  return res.status(200).json({ corrections });
});

export default r;
