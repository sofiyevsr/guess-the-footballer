import React, { useState } from "react";
import GameView from "@cmpt/game/view";
import { SinglePlayerData } from "utils/services/game/types";
import { useRouter } from "next/router";
import { throttledToast } from "@utils/common";
import GameForm from "@cmpt/game/form";

interface Props {
  players: SinglePlayerData[];
}

function LocalPlayView({ players }: Props) {
  const { push } = useRouter();
  const [progress, setProgress] = useState(0);

  function goToNextStage() {
    if (progress >= players.length - 1) {
      window.sa_event?.("local_game_finished");
      push("/play");
      throttledToast("You have finished the challenge", {
        type: "success",
      });
    } else {
      setProgress((progress) => progress + 1);
    }
  }

  return (
    <GameView
      key={progress}
      player={players[progress]}
      form={
        <GameForm
          onSkip={goToNextStage}
          playerID={players[progress].id}
          playerName={players[progress].playerName}
          onCorrectAnswer={goToNextStage}
        />
      }
    />
  );
}

export default LocalPlayView;
