import { QueryClient } from "@tanstack/react-query";
import { WretchError } from "wretch/resolver";
import { throttledToast } from "./common";

export const globalQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      cacheTime: 0,
      staleTime: Infinity,
      onError: (error) => {
        const defaultError = "Error occured while fetching data";
        if (error instanceof WretchError) {
          throttledToast(error.json?.error ?? defaultError, {
            type: "error",
          });
        } else {
          throttledToast(defaultError, {
            type: "error",
          });
        }
      },
    },
    mutations: {
      onError: (error) => {
        const defaultError = "Error occured while submitting data";
        if (error instanceof WretchError) {
          throttledToast(error.json?.error ?? defaultError, {
            type: "error",
          });
        } else {
          throttledToast(defaultError, {
            type: "error",
          });
        }
      },
    },
  },
});
