import React, { HTMLAttributes, ReactNode } from "react";
import clsx from "classnames";
import Image from "next/image";
import { SinglePlayerData } from "utils/services/game/types/game";
import { STORAGE_URL } from "utils/constants";
import { AnimationProps, motion } from "framer-motion";

interface Props {
  performances: SinglePlayerData["performanceData"];
  className?: HTMLAttributes<HTMLDivElement>["className"];
  children?: ReactNode;
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
  hidden: { opacity: 0, x: "-2rem" },
  show: { opacity: 1, x: 0 },
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

function PerformanceHistoryView({ className, performances, children }: Props) {
  return (
    <div className={clsx("drop-shadow-xl flex flex-col", className)}>
      {children && (
        <div className="overflow-y-scroll rounded-xl">
          {children}
        </div>
      )}
      <h1 className="font-bold text-lg bg-base-100 text-center p-2 border-b rounded-t-xl">
        Performance history
      </h1>
      <div className="overflow-auto rounded-b-xl bg-base-100 flex-1">
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
                        src={STORAGE_URL + "/" + performance.competition.image}
                        alt={performance.competition.shortName + "-image"}
                        fill
                        sizes="70vw"
                        className="inline-block h-full w-auto p-1 object-contain"
                      />
                    </div>
                    <div className="flex-1 font-bold text-ellipsis overflow-hidden max-w-[11rem]">
                      {performance.competition.shortName}
                    </div>
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
