import { api } from "../abstractions/api";
import { ChallengesResponse, type SinglePlayerData } from "./types";

interface LocalModeRequest {
  listID: string;
  rounds: string;
}

export const GameService = {
  getChallenge: async (id: number) => {
    const response = await api
      .get("/player/challenge/" + id)
      .json<SinglePlayerData>();
    return response;
  },
  getChallengesByMonth: async (month: number, year: number) => {
    const response = await api
      .query({ month, year })
      .get("/player/challenges")
      .json<ChallengesResponse>();
    return response;
  },
  getPlayers: async (request: LocalModeRequest) => {
    const response = await api
      .query(request)
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
