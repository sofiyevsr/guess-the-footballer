import { api } from "../abstractions/api";
import { SingleRoom } from "./types";

interface RoomInput {
  size: string;
  nonPublic: boolean;
  listID: string;
  levels: string;
  durationBetweenLevels: string;
  tipRevealingInterval: string;
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
  createRoom: async ({ nonPublic, ...rest }: RoomInput) => {
    const response = await api
      .headers({
        "Content-Type": "application/json",
      })
      .post({ private: nonPublic, ...rest }, "/arena/rooms")
      .json<{ room: SingleRoom }>();
    return response;
  },
};
