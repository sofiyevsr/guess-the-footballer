import { useInfiniteQuery } from "@tanstack/react-query";
import React from "react";
import { ArenaService } from "utils/services/arena";
import LoadingLayout from "@cmpt/layout/loading";
import RoomsTable from "./roomsTable";
import { useMe } from "utils/hooks/requests/useMe";

export const MyRooms = (props: { className?: string }) => {
  const { data: user } = useMe();
  const {
    data,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useInfiniteQuery(["my_rooms"], {
    refetchInterval: 15 * 1000,
    queryFn: ({ pageParam }) => ArenaService.getMyRooms(pageParam),
    getNextPageParam: (data) => data.cursor,
    enabled: user != null,
  });
  const allRooms = React.useMemo(
    () => data?.pages.flatMap((page) => page.rooms),
    [data]
  );
  return (
    <LoadingLayout isLoading={isLoading} isError={isError} refetch={refetch}>
      <RoomsTable
        refetch={refetch}
        isRefetching={isRefetching}
        rooms={allRooms!}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        className={props.className}
      />
    </LoadingLayout>
  );
};
