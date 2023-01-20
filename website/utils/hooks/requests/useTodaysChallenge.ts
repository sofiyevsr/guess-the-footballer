import { useLocalStorage } from "../useStorage";
import z from "zod";
import { getTodayInUTC } from "utils/common";

const schema = z.object({
  startedAt: z.string().datetime({ offset: true }),
  finishedAt: z.string().datetime({ offset: true }).optional(),
  currentProgress: z.object({
    general: z.number(),
    performances: z.number(),
    transfers: z.number(),
  }),
});

export const useTodaysChallenge = () =>
  useLocalStorage<z.infer<typeof schema>>(
    `todays_challenge:${getTodayInUTC()}`,
    schema
  );
