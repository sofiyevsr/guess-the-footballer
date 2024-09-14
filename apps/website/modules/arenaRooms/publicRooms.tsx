import { useInfiniteQuery } from "@tanstack/react-query";
import React from "react";
import { ArenaService } from "utils/services/arena";
import LoadingLayout from "@cmpt/layout/loading";
import RoomsView from "./roomsView";

export const PublicRooms = (props: { className?: string }) => {
  const {
    data,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery(["rooms"], {
    staleTime: 0,
    cacheTime: Infinity,
    queryFn: ({ pageParam }) => ArenaService.getRooms(pageParam),
    getNextPageParam: (data) => data.cursor,
  });
  const allRooms = React.useMemo(
    () => data?.pages.flatMap((page) => page.rooms),
    [data]
  );
  return (
    <LoadingLayout isLoading={isLoading} isError={isError} refetch={refetch}>
      <RoomsView
        rooms={allRooms!}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
        className={props.className}
      />
    </LoadingLayout>
  );
};
