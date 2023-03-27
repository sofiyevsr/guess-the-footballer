import { useQuery } from "@tanstack/react-query";
import { SessionService } from "utils/services/session";
import { WretchError } from "wretch/resolver";

export const useMe = () =>
  useQuery(["me"], {
    queryFn: async () => {
      try {
        return await SessionService.getMe();
      } catch (error) {
        if (error instanceof WretchError) {
          if (error.status === 401) {
            return null;
          }
        }
        throw error;
      }
    },
  });
