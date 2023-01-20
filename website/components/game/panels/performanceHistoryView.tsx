import React, { HTMLAttributes } from "react";
import clsx from "classnames";
import Image from "next/image";
import { SinglePlayerData } from "utils/services/game/types/game";
import { ASSET_URL } from "utils/constants";
import { AnimationProps, motion } from "framer-motion";

interface Props {
  performances: SinglePlayerData["performanceData"];
  className?: HTMLAttributes<HTMLDivElement>["className"];
}

const container: AnimationProps["variants"] = {
  hidden: {
    transition: {
      duration: 0.2,
    },
  },
  show: {
    transition: {
      staggerChildren: 0.25,
    },
  },
};

const item: AnimationProps["variants"] = {
  hidden: { opacity: 0, translateX: "-2rem" },
  show: { opacity: 1, translateX: 0 },
};

const tips = [
  {
    icon: "🏟️",
    hint: "games",
  },
  {
    icon: "⚽",
    hint: "goals",
  },
  {
    icon: "🎯",
    hint: "assists",
  },
  {
    icon: "🟡",
    hint: "yellow cards",
  },
  {
    icon: "🔴",
    hint: "red cards",
  },
] as const;

function PerformanceHistoryView({ className, performances }: Props) {
  return (
    <div
      className={clsx(
        "drop-shadow-2xl flex flex-col bg-base-100 rounded-xl",
        className
      )}
    >
      <h1 className="font-bold text-lg text-center p-2 border-b">
        Performance history
      </h1>
      <div className="overflow-auto">
        <table className="table w-full">
          <thead>
            <tr className="text-center">
              <td>Competition</td>
              {tips.map(({ hint, icon }) => (
                <td key={hint}>
                  <div className="tooltip tooltip-left" data-tip={hint}>
                    {icon}
                  </div>
                </td>
              ))}
            </tr>
          </thead>
          <motion.tbody initial="hidden" animate="show" variants={container}>
            {performances.map((performance, index) => {
              return (
                <motion.tr key={index} variants={item} className="text-center">
                  <td className="text-left flex min-w-[12rem] items-center">
                    <div className="rounded-full bg-blue-500 ring-4 relative inline-block w-10 h-10 mx-2 overflow-hidden">
                      <Image
                        src={ASSET_URL + "/" + performance.competition.image}
                        alt={performance.competition.shortName + "-image"}
                        fill
                        sizes="70vw"
                        className="inline-block h-full w-auto p-1 object-contain"
                      />
                    </div>
                    <span className="font-bold align-middle">
                      {performance.competition.shortName}
                    </span>
                  </td>
                  <td>{performance.performance.matches}</td>
                  <td>{performance.performance.goals}</td>
                  <td>{performance.performance.assists}</td>
                  <td>{performance.performance.yellowCards}</td>
                  <td>{performance.performance.redCards}</td>
                </motion.tr>
              );
            })}
          </motion.tbody>
        </table>
      </div>
    </div>
  );
}

export default PerformanceHistoryView;
