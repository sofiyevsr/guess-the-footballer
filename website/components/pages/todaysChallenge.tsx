import React, { useRef } from "react";
import GameView, { GameState } from "@cmpt/game/view";
import { GameService } from "utils/services/game";
import { useQuery } from "@tanstack/react-query";
import LoadingLayout from "@cmpt/layout/loading";
import { useTodaysChallenge } from "utils/hooks/requests/useTodaysChallenge";
import produce from "immer";

const defaultState: GameState = {
  currentProgress: { general: 1, performances: 0, transfers: 0 },
  startedAt: new Date().toISOString(),
};

function TodaysChallenge() {
  const [gameState, setGameState] = useTodaysChallenge();
  const { data, isError, refetch, isLoading } = useQuery({
    queryKey: ["challenge"],
    queryFn: GameService.getTodaysChallenge,
  });
  const gameStateRef = useRef(gameState);

  // TODO
  if (gameState?.finishedAt != null) {
    return <div>You have finished todays challenge before</div>;
  }

  return (
    <LoadingLayout isLoading={isLoading} isError={isError} refetch={refetch}>
      <GameView
        player={data!}
        onCorrectAnswer={() => {
          const newState = produce(
            gameStateRef.current ?? defaultState,
            (current) => {
              current.finishedAt = new Date().toISOString();
            }
          );
          setGameState(newState);
          gameStateRef.current = newState;
        }}
        syncState={({ currentProgress }) => {
          const newState = produce(
            gameStateRef.current ?? defaultState,
            (current) => {
              current.currentProgress = currentProgress;
            }
          );
          setGameState(newState, true);
          gameStateRef.current = newState;
        }}
        defaultState={gameState}
      />
    </LoadingLayout>
  );
}

export default TodaysChallenge;
