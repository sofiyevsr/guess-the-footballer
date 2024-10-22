import React from "react";
import GameView from "@cmpt/game/view";
import { GameService } from "utils/services/game";
import { useQuery } from "@tanstack/react-query";
import LoadingLayout from "@cmpt/layout/loading";
import { throttledToast } from "@utils/common";
import { markChallengeAsSolved } from "@utils/storage";
import { useRouter } from "next/router";

function Challenge() {
  const {
    query: { id },
    push,
  } = useRouter();

  const enabled = !Number.isNaN(Number(id)) && !!Number(id);
  const { data, isError, refetch, isLoading } = useQuery({
    queryKey: ["challenge", id],
    queryFn: () => GameService.getChallenge(Number(id)),
    enabled,
  });

  return (
    <LoadingLayout
      isLoading={isLoading && enabled}
      isError={isError || !enabled}
      refetch={refetch}
    >
      <GameView
        player={data!}
        onCorrectAnswer={() => {
          window.sa_event?.("daily_challenge_solved");
          markChallengeAsSolved(Number(id));
          push("/challenges");
          throttledToast("Successfully solved the challenge", {
            type: "success",
          });
        }}
      />
    </LoadingLayout>
  );
}

export default Challenge;
