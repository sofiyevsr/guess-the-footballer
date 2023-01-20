import React, { HTMLAttributes } from "react";
import clsx from "classnames";
import Image from "next/image";
import { SinglePlayerData } from "utils/services/game/types/game";
import { ASSET_URL } from "utils/constants";
import { AnimationProps, motion } from "framer-motion";

interface Props {
  transfers: SinglePlayerData["transferHistory"];
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

function TransferHistoryView({ className, transfers }: Props) {
  return (
    <div
      className={clsx(
        "flex flex-col drop-shadow-2xl bg-base-100 rounded-xl",
        className
      )}
    >
      <h1 className="font-bold text-lg text-center p-2 border-b">
        Transfer history
      </h1>
      <div className="overflow-auto">
        <table className="table w-full">
          <thead>
            <tr className="text-center">
              <td>Season</td>
              <td>From</td>
              <td>To</td>
              <td>Fee</td>
              <td>Type</td>
            </tr>
          </thead>
          <motion.tbody initial="hidden" animate="show" variants={container}>
            {transfers.map((transfer, index) => {
              return (
                <motion.tr
                  key={index}
                  variants={item}
                  className="text-center"
                >
                  <td>{transfer.season}</td>
                  <td>
                    <div className="relative inline-block w-10 h-10 mx-2 overflow-hidden">
                      <Image
                        src={ASSET_URL + "/" + transfer.oldClubImage}
                        alt={transfer.oldClubName + "-image"}
                        fill
                        sizes="70vw"
                        className="mr-1 h-full w-auto object-contain"
                      />
                    </div>
                    <div className="font-bold">{transfer.oldClubName}</div>
                  </td>
                  <td>
                    <div className="relative inline-block w-10 h-10 mx-2 overflow-hidden">
                      <Image
                        src={ASSET_URL + "/" + transfer.newClubImage}
                        alt={transfer.newClubName + "-image"}
                        fill
                        sizes="70vw"
                        className="mr-1 h-full w-auto object-contain"
                      />
                    </div>
                    <div className="font-bold">{transfer.newClubName}</div>
                  </td>
                  <td>
                    <div className="mx-1">
                      <span className="font-bold">
                        €{transfer.transferFeeValue}m
                      </span>
                    </div>
                  </td>
                  <td>
                    {transfer.isLoan === true ? (
                      <div className="badge badge-warning">LOAN</div>
                    ) : (
                      <div className="badge badge-success">TRANSFER</div>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </motion.tbody>
        </table>
      </div>
    </div>
  );
}

export default TransferHistoryView;
