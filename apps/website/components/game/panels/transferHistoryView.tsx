import React, { HTMLAttributes, ReactNode } from "react";
import clsx from "classnames";
import Image from "next/image";
import { SinglePlayerData } from "utils/services/game/types";
import { AnimationProps, motion } from "framer-motion";

interface Props {
  transfers: SinglePlayerData["transferHistory"];
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

function TransferHistoryView({ className, transfers, children }: Props) {
  return (
    <div className={clsx("flex flex-col drop-shadow-xl", className)}>
      <h1 className="font-bold text-lg text-center bg-base-100 p-2 border-b rounded-t-xl">
        Transfer history
      </h1>
      <div className="overflow-auto rounded-b-xl bg-base-100 flex-1">
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
                <motion.tr key={index} variants={item} className="text-center">
                  <td>{transfer.season}</td>
                  <td>
                    <div className="relative inline-block w-10 h-10 mx-2 overflow-hidden">
                      <Image
                        src={transfer.oldClubImage}
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
                        src={transfer.newClubImage}
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
                      {transfer.transferFeeValue === -1 ? (
                        <div className="badge badge-info font-bold">FREE</div>
                      ) : (
                        <span className="font-bold">
                          {transfer.transferFeeCurrency}
                          {transfer.transferFeeValue}
                          {transfer.transferFeeNumeral}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    {transfer.isLoan === true ? (
                      <div className="badge badge-warning font-bold">LOAN</div>
                    ) : (
                      <div className="badge badge-success font-bold">
                        TRANSFER
                      </div>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </motion.tbody>
        </table>
      </div>
      {children && (
        <div className="flex-1 overflow-y-scroll max-h-full mt-2 rounded-xl">
          {children}
        </div>
      )}
    </div>
  );
}

export default TransferHistoryView;
