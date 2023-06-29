import { CronJob } from "cron";
import { Express } from "express";
import { dailyChallengeCronFn, dailyChallengeCronConfig } from "scheduled/dailyChallenge";
import { runInDev } from "utils/misc/runInDev";
import { retry } from "utils/retry";

async function startup(app: Express) {
  await runInDev(async () => {
    const { default: morgan } = await import("morgan");
    app.use(morgan("dev"));
    console.log("registered dev logger...");
  });
  initializeJobs();
}

function initializeJobs() {
  new CronJob(
    dailyChallengeCronConfig.cron,
    retry.bind(undefined, dailyChallengeCronFn, 3),
    null,
    true,
    "UTC"
  );
}

export default startup;
