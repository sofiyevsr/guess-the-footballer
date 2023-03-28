import { api } from "../abstractions/api";
import { gameDifficulties } from "../game/types/game";
import { SingleRoom } from "./types";

interface RoomInput {
  size: string;
  nonPublic: boolean;
  difficulty: (typeof gameDifficulties)[number];
}

export const ArenaService = {
  getRooms: async (cursor?: number) => {
    const response = await api
      .query({ cursor })
      .get("/arena/rooms")
      .json<{ cursor?: number; rooms: SingleRoom[] }>();
    return response;
  },
  getMyRooms: async (cursor?: number) => {
    const response = await api
      .query({ cursor })
      .get("/arena/my-rooms")
      .json<{ cursor?: number; rooms: SingleRoom[] }>();
    return response;
  },
  createRoom: async ({ size, nonPublic, difficulty }: RoomInput) => {
    const response = await api
      .headers({
        "Content-Type": "application/json",
      })
      .post({ size, private: nonPublic, difficulty }, "/arena/rooms")
      .json<{ room: SingleRoom }>();
    return response;
  },
};
