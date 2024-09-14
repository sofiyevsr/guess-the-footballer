import TipsContainer from "@cmpt/containers/tipsContainer";
import ProgressRadial from "@cmpt/progress/radial";
import dayjs from "dayjs";
import { produce } from "immer";
import { ReactNode, useCallback, useRef, useState } from "react";
import { SinglePlayerData } from "utils/services/game/types";
import { getTips, SingleTip } from "utils/tips";
import GameForm from "./form";
import GameTimer from "./misc/timer";
import PerformanceHistoryView from "./panels/performanceHistoryView";
import TransferHistoryView from "./panels/transferHistoryView";
import MarketValueLine from "./marketValue";
import { GameState } from "@typ/game";

interface TipsState {
  general: SingleTip[];
  performances: SinglePlayerData["performanceData"];
  transfers: SinglePlayerData["transferHistory"];
}

type ProgressState = {
  [key in keyof TipsState]: number;
};

interface Props {
  player: SinglePlayerData;
  form?: ReactNode;
  onCorrectAnswer?: (answer: string) => void;
  tipDuration?: number;
  defaultState?: GameState;
  leftComponent?: ReactNode;
  rightComponent?: ReactNode;
}

const GameView = ({
  player,
  onCorrectAnswer,
  defaultState,
  form,
  leftComponent,
  rightComponent,
  tipDuration = 3,
}: Props) => {
  const [playerTips] = useState<TipsState>(() => ({
    general: getTips(player),
    performances: player.performanceData,
    transfers: player.transferHistory,
  }));

  const [currentProgress, setCurrentProgress] = useState<ProgressState>(() => {
    if (defaultState == null)
      return {
        general: 1,
        performances: 0,
        transfers: 0,
      };
    const progress = Math.floor(
      dayjs().diff(dayjs(defaultState.startedAt), "second") / tipDuration
    );
    return {
      general: Math.min(Math.max(1, progress), playerTips.general.length),
      performances: Math.min(progress, playerTips.performances.length),
      transfers: Math.min(progress, playerTips.transfers.length),
    };
  });

  const timerInSeconds =
    defaultState == null
      ? 1
      : dayjs().diff(dayjs(defaultState.startedAt), "second");

  const shouldRevealTip =
    currentProgress.general < playerTips.general.length ||
    currentProgress.transfers < playerTips.transfers.length ||
    currentProgress.performances < playerTips.performances.length;

  const stateRef = useRef({ currentProgress, playerTips });
  stateRef.current = { currentProgress, playerTips };

  const onEnd = useCallback(() => {
    const newProgress = produce(stateRef.current.currentProgress, (draft) => {
      if (draft.general < stateRef.current.playerTips.general.length)
        draft.general++;
      if (draft.transfers < stateRef.current.playerTips.transfers.length)
        draft.transfers++;
      if (draft.performances < stateRef.current.playerTips.performances.length)
        draft.performances++;
    });
    setCurrentProgress(newProgress);
    const shouldRestart =
      newProgress.general < stateRef.current.playerTips.general.length ||
      newProgress.transfers < stateRef.current.playerTips.transfers.length ||
      newProgress.performances <
        stateRef.current.playerTips.performances.length;

    return shouldRestart;
  }, []);

  return (
    <div className="flex flex-col lg:flex-row lg:h-full">
      <div className="mx-4 order-1 flex-1 flex items-center flex-col lg:order-2">
        <div className="my-1 h-6 text-center font-bold text-lg">
          {shouldRevealTip === true && "Next tip will be revealed in"}
        </div>
        <ProgressRadial
          disabled={!shouldRevealTip}
          seconds={tipDuration}
          onEnd={onEnd}
        />
        <MarketValueLine marketValue={player.marketValue} />
        {form ?? (
          <GameForm
            playerID={player.id}
            playerName={player.playerName}
            onCorrectAnswer={onCorrectAnswer}
          />
        )}
        <TipsContainer
          tips={playerTips.general.slice(0, currentProgress.general)}
        />
      </div>
      <PerformanceHistoryView
        performances={playerTips.performances.slice(
          0,
          currentProgress.performances
        )}
        className="order-2 m-2 lg:order-1 lg:w-[26rem]"
      >
        {leftComponent}
      </PerformanceHistoryView>
      <TransferHistoryView
        transfers={playerTips.transfers.slice(0, currentProgress.transfers)}
        className="order-3 m-2 mb-16 lg:mb-20 lg:order-3 lg:w-[26rem]"
      >
        {rightComponent}
      </TransferHistoryView>
      <GameTimer defaultValue={timerInSeconds} />
    </div>
  );
};

export default GameView;
