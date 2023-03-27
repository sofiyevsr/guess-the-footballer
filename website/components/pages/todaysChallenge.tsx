import React, { useEffect, useRef } from "react";
import GameView from "@cmpt/game/view";
import clsx from "classnames";
import { GameService } from "utils/services/game";
import { useQuery } from "@tanstack/react-query";
import LoadingLayout from "@cmpt/layout/loading";
import { useTodaysChallenge } from "utils/hooks/requests/useTodaysChallenge";
import produce from "immer";
import dayjs from "dayjs";
import CompletedIcon from "@cmpt/icons/completed";
import { formatDate } from "utils/common";

function TodaysChallenge() {
  const [{ state: gameState, isLoading: isLoadingState }, setGameState] =
    useTodaysChallenge();
  const { data, isError, refetch, isLoading } = useQuery({
    queryKey: ["challenge"],
    queryFn: GameService.getTodaysChallenge,
  });
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  useEffect(() => {
    if (isLoadingState || gameState != null) return;
    const newState = { startedAt: dayjs().format() };
    setGameState(newState);
  }, [gameState, isLoadingState]);

  if (gameState?.finishedAt != null)
    return (
      <div className="min-h-[16rem] full flex flex-col items-center justify-center px-4 text-center">
        <CompletedIcon width={200} height={200} />
        <h1 className="text-2xl my-4 md:text-4xl">
          <span>{"You have completed today's challenge at "}</span>
          <span className="font-bold">
            {formatDate(gameState.finishedAt, "LT")}
          </span>
        </h1>
        <button
          disabled={gameState == null}
          className={clsx("btn btn-primary text-white my-4 md:btn-wide", {
            loading: gameState == null,
          })}
          onClick={() => {
            setGameState(undefined);
          }}
        >
          Replay
        </button>
      </div>
    );

  return (
    <LoadingLayout
      isLoading={isLoading || isLoadingState || gameState == null}
      isError={isError}
      refetch={refetch}
    >
      <GameView
        player={data!}
        onCorrectAnswer={() => {
          if (gameStateRef.current == null) return;
          const newState = produce(gameStateRef.current, (current) => {
            current.finishedAt = dayjs().format();
          });
          setGameState(newState);
        }}
        defaultState={gameState}
      />
    </LoadingLayout>
  );
}

export default TodaysChallenge;
