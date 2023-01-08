import React, { HTMLAttributes } from "react";
import clsx from "classnames";
import Image from "next/image";
import { SinglePlayerData } from "utils/services/game/types/game";
import { Transition } from "@headlessui/react";
import { ASSET_URL } from "utils/constants";

interface Props {
  transfers: SinglePlayerData["transferHistory"];
  className?: HTMLAttributes<HTMLDivElement>["className"];
}

function TransferHistoryView({ className, transfers }: Props) {
  return (
    <div className={clsx("drop-shadow-2xl bg-base-100 rounded-xl", className)}>
      <h1 className="font-bold text-lg text-center p-2 border-b">
        Transfer history
      </h1>
      <div className="overflow-x-auto">
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
          <tbody>
            {transfers.map((transfer, index) => {
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
                  <td>{transfer.season}</td>
                  <td>
                    <Image
                      src={ASSET_URL + "/" + transfer.oldClubImage}
                      alt={transfer.oldClubName + "-image"}
                      width={20}
                      height={20}
                      className="mx-1 inline w-auto h-auto"
                    />
                    <span className="align-middle mx-2">
                      {transfer.oldClubName}
                    </span>
                  </td>
                  <td>
                    <Image
                      src={ASSET_URL + "/" + transfer.newClubImage}
                      alt={transfer.newClubName + "-image"}
                      width={20}
                      height={20}
                      className="mx-1 inline w-auto h-auto"
                    />
                    <span className="align-middle mx-2">
                      {transfer.newClubName}
                    </span>
                  </td>
                  <td>
                    <span className="font-bold">€</span>
                    {transfer.transferFeeValue}m
                  </td>
                  <td>
                    {transfer.isLoan === true ? (
                      <div className="badge badge-warning">LOAN</div>
                    ) : (
                      <div className="badge badge-success">TRANSFER</div>
                    )}
                  </td>
                </Transition>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TransferHistoryView;
