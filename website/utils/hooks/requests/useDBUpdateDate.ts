import { useQuery } from "@tanstack/react-query";
import { HealthService } from "utils/services/health";

export const useDBUpdateDate = () =>
  useQuery(["health/seed_date"], {
    queryFn: async () => {
      return HealthService.getDBUpdateDate();
    },
  });
