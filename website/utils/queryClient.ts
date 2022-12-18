import { QueryClient } from "@tanstack/react-query";

export const globalQueryClient = new QueryClient({
  defaultOptions: { queries: { cacheTime: 0, staleTime: Infinity } },
});
