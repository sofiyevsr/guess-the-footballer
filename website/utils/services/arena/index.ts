import { api } from "../abstractions/api";
import { SingleRoom } from "./types";

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
  createRoom: async ({
    size,
    nonPublic,
  }: {
    size: number;
    nonPublic: boolean;
  }) => {
    const response = await api
      .headers({
        "Content-Type": "application/json",
      })
      .post({ size, private: nonPublic }, "/arena/rooms")
      .json<{ room: SingleRoom }>();
    return response;
  },
};
