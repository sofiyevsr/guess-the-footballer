import db from "db";
import { dailyChallenge } from "db/schema/player";
import { desc } from "drizzle-orm";
import { playerCount } from "utils/constants";
import { getRandomNumber } from "utils/random";

export const dailyChallengeCronConfig = {
  cron: "00 00 00 * * *",
};

export async function dailyChallengeCronFn() {
  console.log("running the daily challenge cron...");
  const [currentChallenge] = await db
    .select({ player_id: dailyChallenge.player_id })
    .from(dailyChallenge)
    .orderBy(desc(dailyChallenge.id))
    .limit(1);
  let randomID = getRandomNumber([1, playerCount]);
  while (currentChallenge != null && randomID === currentChallenge.player_id) {
    randomID = getRandomNumber([1, playerCount]);
  }
  await db.insert(dailyChallenge).values({ player_id: randomID });
}
