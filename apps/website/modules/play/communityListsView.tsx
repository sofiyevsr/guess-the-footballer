import LoadingLayout from "@cmpt/layout/loading";
import RevealAnimation from "@cmpt/misc/revealAnimation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { GameListService } from "@utils/services/gameList";
import React, { useState } from "react";
import GameListItem from "./_components/listItem";
import clsx from "clsx";
import { PlaySettingsModal } from "./playSettingsModal";

interface Props {
  className?: string;
}

function CommunityListsView({ className }: Props) {
  const [listID, setListID] = useState<string>();
  const { data, isLoading, isError, refetch } = useInfiniteQuery(
    ["community_lists"],
    {
      staleTime: 0,
      cacheTime: Infinity,
      queryFn: ({ pageParam }) => GameListService.getCommunityLists(pageParam),
      getNextPageParam: (data) => data.cursor,
    }
  );

  const allLists = React.useMemo(
    () => data?.pages.flatMap((page) => page.gameLists),
    [data]
  );

  return (
    <>
      <RevealAnimation
        className={clsx(className, "py-4 self-stretch mx-4 md:mx-12", {
          "grid gap-4 grid-cols-1 md:grid-col-3 lg:grid-cols-4":
            !isLoading && !isError,
        })}
      >
        <LoadingLayout
          isLoading={isLoading}
          isError={isError}
          refetch={refetch}
        >
          {allLists?.map((list) => (
            <GameListItem
              key={list.id}
              item={list}
              onClick={(id) => setListID(id)}
            />
          ))}
        </LoadingLayout>
      </RevealAnimation>
      <PlaySettingsModal listID={listID} setListID={setListID} />
    </>
  );
}

export default CommunityListsView;
