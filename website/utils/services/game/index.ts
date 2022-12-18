import { API_URL } from "utils/constants";
import { gameDifficulties, SinglePlayerData } from "./types/game";

export const GameService = {
  getTodaysChallenge: async (): Promise<SinglePlayerData> => {
    const response = await fetch(`${API_URL}/player/challenge`);
    const json = await response.json();
    return json;
  },
  getPlayers: async (
    difficulty: typeof gameDifficulties[number]
  ): Promise<SinglePlayerData> => {
    const response = await fetch(`${API_URL}/player?difficulty=${difficulty}`);
    const json = await response.json();
    return json;
  },
  submitAnswer: async (id: number): Promise<SinglePlayerData> => {
    const response = await fetch(`${API_URL}/player/answer/${id}`, {
      method: "POST",
    });
    const json = await response.json();
    return json;
  },
};
