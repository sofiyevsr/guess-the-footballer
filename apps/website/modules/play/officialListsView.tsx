import LoadingLayout from "@cmpt/layout/loading";
import RevealAnimation from "@cmpt/misc/revealAnimation";
import { useQuery } from "@tanstack/react-query";
import { GameListService } from "@utils/services/gameList";
import React, { useState } from "react";
import GameListItem from "./_components/listItem";
import clsx from "clsx";
import { PlaySettingsModal } from "./playSettingsModal";

interface Props {
  className?: string;
}

function OfficialListsView({ className }: Props) {
  const [listID, setListID] = useState<string>();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["official_lists"],
    staleTime: 0,
    cacheTime: Infinity,
    queryFn: () => GameListService.getOfficialLists(),
  });

  return (
    <>
      <RevealAnimation
        className={clsx(className, "py-4 h-full self-stretch mx-4 md:mx-12 ", {
          "grid gap-4 grid-cols-1 md:grid-col-3 lg:grid-cols-4":
            !isLoading && !isError,
        })}
      >
        <LoadingLayout
          isLoading={isLoading}
          isError={isError}
          refetch={refetch}
        >
          {data?.gameLists.map((list) => (
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

export default OfficialListsView;
