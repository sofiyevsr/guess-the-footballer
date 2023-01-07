import React, { HTMLAttributes } from "react";
import clsx from "classnames";
import Image from "next/image";
import { Transition } from "@headlessui/react";
import { SinglePlayerData } from "utils/services/game/types/game";
import { ASSET_URL } from "utils/constants";

interface Props {
  performances: SinglePlayerData["performanceData"];
  className?: HTMLAttributes<HTMLDivElement>["className"];
}

function PerformanceHistoryView({ className, performances }: Props) {
  return (
    <div className={clsx("drop-shadow-2xl bg-base-100 rounded-xl", className)}>
      <h1 className="font-bold text-lg text-center p-2 border-b">
        Performance history
      </h1>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr className="text-center">
              <td>Competition</td>
              <td>🏟️</td>
              <td>⚽</td>
              <td>🎯</td>
              <td>🟡</td>
              <td>🔴</td>
            </tr>
          </thead>
          <tbody>
            {performances.map((performance, index) => {
              return (
                <Transition
                  key={index}
                  appear
                  show
                  style={{ transitionDelay: `${(index + 1) * 50}ms` }}
                  enter="transition-all duration-200"
                  enterFrom="opacity-0 translate-x-[-2rem]"
                  enterTo="opacity-100 translate-x-0"
                  as="tr"
                  className="text-center"
                >
                  <td className="text-left">
                    <Image
                      src={ASSET_URL + "/" + performance.competition.image}
                      alt={performance.competition.shortName + "-image"}
                      width={20}
                      height={20}
                      className="object-cover mx-1 inline h-auto w-auto"
                    />
                    <span className="align-middle">
                      {performance.competition.shortName}
                    </span>
                  </td>
                  <td>{performance.performance.matches}</td>
                  <td>{performance.performance.goals}</td>
                  <td>{performance.performance.assists}</td>
                  <td>{performance.performance.yellowCards}</td>
                  <td>{performance.performance.redCards}</td>
                </Transition>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PerformanceHistoryView;
