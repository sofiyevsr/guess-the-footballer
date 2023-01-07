import TipCard from "@cmpt/card/tipCard";
import ProgressRadial from "@cmpt/progress/radial";
import { produce } from "immer";
import { useRef, useState } from "react";
import { shuffleArray } from "utils/common";
import { SinglePlayerData } from "utils/services/game/types/game";
import { getTips } from "utils/tips";
import GameForm from "./form";
import GameTimer from "./misc/timer";
import PerformanceHistoryView from "./panels/performanceHistoryView";
import TransferHistoryView from "./panels/transferHistoryView";

interface Props {
  player: SinglePlayerData;
  onSubmit: (answer: string) => void;
}

const GameView = ({ player, onSubmit }: Props) => {
  const [playerTips] = useState({
    general: shuffleArray(getTips(player)),
    performances: shuffleArray(player.performanceData),
    transfers: shuffleArray(player.transferHistory),
  });

  const [currentProgress, setCurrentProgress] = useState({
    general: 1,
    performances: 0,
    transfers: 0,
  });

  const [shouldRevealTip, setShouldRevealTip] = useState(true);

  const stateRef = useRef({ currentProgress, playerTips });
  stateRef.current = { currentProgress, playerTips };

  return (
    <div className="flex flex-col mb-20 h-full lg:flex-row lg:mb-0">
      <div className="mx-8 order-1 flex-1 flex items-center flex-col lg:order-2">
        <div className="my-2 h-6 text-center font-bold text-lg">
          {shouldRevealTip === true && "Next tip will be revealed in"}
        </div>
        <ProgressRadial
          seconds={3}
          onEnd={() => {
            const newProgress = produce(
              stateRef.current.currentProgress,
              (draft) => {
                if (draft.general < stateRef.current.playerTips.general.length)
                  draft.general++;
                if (
                  draft.transfers < stateRef.current.playerTips.transfers.length
                )
                  draft.transfers++;
                if (
                  draft.performances <
                  stateRef.current.playerTips.performances.length
                )
                  draft.performances++;
              }
            );
            setCurrentProgress(newProgress);
            const shouldRestart =
              newProgress.general <
                stateRef.current.playerTips.general.length ||
              newProgress.transfers <
                stateRef.current.playerTips.transfers.length ||
              newProgress.performances <
                stateRef.current.playerTips.performances.length;

            setShouldRevealTip(shouldRestart);

            return shouldRestart;
          }}
        />
        <GameForm
          playerID={player.id}
          playerName={player.playerName}
          onSubmit={onSubmit}
        />
        <div className="flex-1 grid grid-cols-2 auto-rows-[10rem] w-full gap-4 my-4 overflow-y-scroll sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-3">
          {playerTips.general
            .slice(0, currentProgress.general)
            .map(({ id, title, text, children }) => (
              <TipCard title={title} key={id} text={text}>
                {children}
              </TipCard>
            ))}
        </div>
      </div>
      <PerformanceHistoryView
        performances={playerTips.performances.slice(
          0,
          currentProgress.performances
        )}
        className="order-2 m-2 lg:order-1 lg:w-96"
      />
      <TransferHistoryView
        transfers={playerTips.transfers.slice(0, currentProgress.transfers)}
        className="order-3 m-2 lg:order-3 lg:w-96"
      />
      <GameTimer />
    </div>
  );
};

export default GameView;
