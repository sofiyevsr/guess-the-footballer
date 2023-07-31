import db from "db";
import { players } from "db/schema";
import fs from "fs/promises";
import { dailyChallengeCronFn } from "scheduled/dailyChallenge";

interface JSONPlayer {
  id: number;
  value: string;
}

const main = async () => {
  const raw = await fs.readFile("./seed_data/players-1690551177.json");
  const data: JSONPlayer[] = JSON.parse(raw.toString());
  // await db.insert(players).values(data);
  console.log("Wrote %d players", data.length);
  await dailyChallengeCronFn();
  console.log("Daily Challenge created");
  process.exit(0);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
