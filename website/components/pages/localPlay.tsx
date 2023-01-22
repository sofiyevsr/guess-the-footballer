import React, { useState } from "react";
import GameView from "@cmpt/game/view";
import { SinglePlayerData } from "utils/services/game/types/game";
import CompletedIcon from "@cmpt/icons/completed";
import DifficultyButtons from "@cmpt/containers/difficultyButtons";

interface Props {
  players: SinglePlayerData[];
}

function LocalPlayView({ players }: Props) {
  const [progress, setProgress] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);

  if (gameEnded === true)
    return (
      <div className="min-h-[16rem] full flex flex-col items-center justify-center px-4 text-center">
        <CompletedIcon width={200} height={200} />
        <h1 className="font-bold text-4xl my-4">
          Congratulations, you have successfully completed current level!
        </h1>
        <h1 className="text-lg text-gray-400 my-4">
          Questions for each difficulty is updated every 5 minutes, choose a difficulty to replay:
        </h1>
        <DifficultyButtons />
      </div>
    );

  return (
    <GameView
      player={players[progress]}
      onCorrectAnswer={() => {
        if (progress >= players.length - 1) {
          setGameEnded(true);
        } else {
          setProgress((progress) => progress + 1);
        }
      }}
    />
  );
}

export default LocalPlayView;
