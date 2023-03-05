import AbortAddon from "wretch/addons/abort";
import { api } from "../abstractions/api";
import { Session } from "./types";

export const SessionService = {
  getMe: async () => {
    const response = await api.get("/session/me").json<Session>();
    return response;
  },
  checkUsername: (username: string) => {
    const [controller, request] = api
      .addon(AbortAddon())
      .query({ username })
      .get("/session/check-username")
      .controller();
    const fetch = request.json<{ available: boolean }>();
    return [controller as AbortController, fetch] as const;
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
