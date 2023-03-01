import { api } from "../abstractions/api";
import { gameDifficulties, SinglePlayerData } from "./types/game";

export const GameService = {
  getTodaysChallenge: async () => {
    const response = await api
      .get("/player/challenge")
      .json<SinglePlayerData>();
    return response;
  },
  getPlayers: async (difficulty: typeof gameDifficulties[number]) => {
    const response = await api
      .query({ difficulty })
      .get("/player")
      .json<SinglePlayerData[]>();
    return response;
  },
  submitAnswer: async (id: number, answer: string) => {
    const response = await api
      .headers({
        "Content-Type": "application/json",
      })
      .post({ answer }, `/player/answer/${id}`)
      .json<{ corrections: string | null }>();
    return response;
  },
};
