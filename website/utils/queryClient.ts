import { QueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

export const globalQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retryDelay: () => 500,
      cacheTime: 0,
      staleTime: Infinity,
      onError: () => {
        toast("Error occured while fetching data", { type: "error" });
      },
    },
    mutations: {
      onError: () => {
        toast("Error occured while submitting data", { type: "error" });
      },
    },
  },
});
