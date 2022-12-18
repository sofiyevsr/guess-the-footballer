import TipCard from "@cmpt/card/tipCard";
import SeparatedInput from "@cmpt/input/separated";
import ProgressRadial from "@cmpt/progress/radial";
import { SinglePlayerData } from "utils/services/game/types/game";
import { getTips } from "utils/tips";
import PerformanceHistoryView from "./performanceHistoryView";
import TransferHistoryView from "./transferHistoryView";

interface Props {
  player: SinglePlayerData;
}

const GameView = ({ player }: Props) => {
  const tips = getTips(player);
  return (
    <div className="flex flex-col lg:flex-row h-full">
      <div className="order-1 flex-1 flex items-center flex-col lg:order-2">
        <ProgressRadial seconds={10} onEnd={() => true} />
        <div className="flex flex-col w-full items-center overflow-x-auto">
          {player.playerName.split(" ").map((name, index) => (
            <SeparatedInput
              key={index}
              length={name.length}
              containerClassName="my-2"
              className="mx-1"
            />
          ))}
        </div>
        <button className="btn btn-primary self-center my-2">Submit</button>
        <div className="flex-1 grid grid-cols-2 auto-rows-[10rem] gap-2 my-4 overflow-y-scroll sm:grid-cols-2 lg:grid-cols-4 lg:gap-3">
          {tips.map(({ id, title, text, children }) => (
            <TipCard title={title} key={id} text={text}>
              {children}
            </TipCard>
          ))}
        </div>
      </div>
      <PerformanceHistoryView
        performances={player.performanceData}
        className="order-2 m-2 lg:order-1 lg:w-96"
      />
      <TransferHistoryView
        transfers={player.transferHistory}
        className="order-3 m-2 lg:order-3 lg:w-96"
      />
    </div>
  );
};

export default GameView;
