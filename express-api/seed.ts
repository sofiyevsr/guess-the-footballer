import fs from "fs/promises";
import { dailyChallengeCronFn } from "scheduled/dailyChallenge";

interface JSONPlayer {
  id: number;
  value: string;
}

const main = async () => {
  const filename = process.env.PLAYERS_FILENAME;
  if (filename == null) {
    throw Error("Filename not found in env");
  }
  const raw = await fs.readFile(`./seed_data/${filename}`);
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
