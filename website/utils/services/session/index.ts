import { api } from "../abstractions/api";
import { Session } from "./types";

export const SessionService = {
  getMe: async () => {
    const response = await api.get("/session/me").json<Session>();
    return response;
  },
  checkUsername: async (username: string) => {
    const response = await api
      .query({ username })
      .get("/session/check-username")
      .json<{ available: boolean }>();
    return response;
  },
  createSession: async (body: { username: string }) => {
    const response = await api
      .headers({
        "Content-Type": "application/json",
      })
      .post(body, "/session")
      .json<Session & { token: string }>();
    return response;
  },
};
