import { QueryClient } from "@tanstack/react-query";
import { throttledToast } from "./common";

export const globalQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      cacheTime: 0,
      staleTime: Infinity,
      onError: () => {
        throttledToast("Error occured while fetching data", { type: "error" });
      },
    },
    mutations: {
      onError: () => {
        throttledToast("Error occured while submitting data", {
          type: "error",
        });
      },
    },
  },
});
