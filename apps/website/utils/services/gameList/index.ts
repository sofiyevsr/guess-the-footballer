import { api } from "../abstractions/api";
import {
  GameListResponse,
  SearchGameListResponse,
  GameListInput,
  SearchPlayerResponse,
} from "./types";

export const GameListService = {
  searchPlayer: async (query: string | undefined) => {
    const response = await api
      .query({ query })
      .get("/gameList/searchPlayer")
      .json<SearchPlayerResponse>();
    return response;
  },
  searchGameList: async (query: string | undefined) => {
    const response = await api
      .query({ query })
      .get("/gameList/search")
      .json<SearchGameListResponse>();
    return response;
  },
  getCommunityLists: async (cursor: number | undefined) => {
    const response = await api
      .query({ cursor })
      .get("/gameList/community")
      .json<GameListResponse>();
    return response;
  },
  getOfficialLists: async () => {
    const response = await api
      .get("/gameList/official")
      .json<GameListResponse>();
    return response;
  },
  submitGameList: async (input: GameListInput) => {
    const response = await api
      .headers({
        "Content-Type": "application/json",
      })
      .post(input, "/gameList")
      .json<{ gameList: GameListResponse["gameLists"][number] }>();
    return response;
  },
};
