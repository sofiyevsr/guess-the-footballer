import React, { ComponentProps, useCallback, useRef } from "react";
import GameView, { GameState } from "@cmpt/game/view";
import { GameService } from "utils/services/game";
import { useQuery } from "@tanstack/react-query";
import LoadingLayout from "@cmpt/layout/loading";
import { useTodaysChallenge } from "utils/hooks/requests/useTodaysChallenge";
import produce from "immer";
import dayjs from "dayjs";
import CompletedIcon from "@cmpt/icons/completed";
import { getTimeDifference } from "utils/common";

const defaultState: GameState = {
  currentProgress: { general: 1, performances: 0, transfers: 0 },
  startedAt: dayjs().format(),
};

function TodaysChallenge() {
  const [{ state: gameState, isLoading: isLoadingState }, setGameState] =
    useTodaysChallenge();
  const { data, isError, refetch, isLoading } = useQuery({
    queryKey: ["challenge"],
    queryFn: GameService.getTodaysChallenge,
  });
  const gameStateRef = useRef<GameState>();

  if (!isLoadingState && gameStateRef.current == null)
    gameStateRef.current = gameState;

  const syncState = useCallback<
    NonNullable<ComponentProps<typeof GameView>["syncState"]>
  >(
    ({ currentProgress }) => {
      const newState = produce(
        gameStateRef.current ?? defaultState,
        (current) => {
          current.currentProgress = currentProgress;
        }
      );
      setGameState(newState, true);
      gameStateRef.current = newState;
    },
    [setGameState]
  );

  return (
    <LoadingLayout
      isLoading={isLoading || isLoadingState}
      isError={isError}
      refetch={refetch}
    >
      {gameState?.finishedAt != null ? (
        <div className="min-h-[16rem] full flex flex-col items-center justify-center px-4 text-center">
          <CompletedIcon width={200} height={200} />
          <h1 className="text-4xl my-4">
            <span>{"You have completed today's challenge in "}</span>
            <span className="font-bold">
              {
                getTimeDifference(
                  dayjs(gameState.startedAt),
                  dayjs(gameState.finishedAt)
                ) as string
              }
            </span>
          </h1>
          <button
            className="btn btn-error text-white my-4 md:btn-wide"
            onClick={() => {
              setGameState(undefined);
              gameStateRef.current = undefined;
            }}
          >
            Replay
          </button>
        </div>
      ) : (
        <GameView
          player={data!}
          onCorrectAnswer={() => {
            const newState = produce(
              gameStateRef.current ?? defaultState,
              (current) => {
                current.finishedAt = dayjs().format();
              }
            );
            setGameState(newState);
            gameStateRef.current = newState;
          }}
          syncState={syncState}
          defaultState={gameState}
        />
      )}
    </LoadingLayout>
  );
}

export default TodaysChallenge;
