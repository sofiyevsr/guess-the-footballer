import { api } from "../abstractions/api";
import { LastDBUpdate } from "./types";

export const HealthService = {
  getDBUpdateDate: async () => {
    const response = await api.get("/health/seed/date").json<LastDBUpdate>();
    return response;
  },
};
