import React from "react";
import clsx from "classnames";
import { SingleRoom } from "utils/services/arena/types";
import Clipboard from "@cmpt/misc/clipboard";
import { useRouter } from "next/router";
import { WEBSITE_URL } from "utils/constants";

interface Props {
  room: SingleRoom | undefined;
  reset: () => void;
}

export const NewRoomModal = ({ room, reset }: Props) => {
  const { push } = useRouter();
  return (
    <div
      className={clsx("modal modal-bottom sm:modal-middle", {
        "modal-open": room != null,
      })}
    >
      <div className="modal-box">
        <h3 className="font-bold text-lg">
          You have created a new room successfully
        </h3>
        <p className="py-4">Do you want to join the room now?</p>
        <Clipboard
          text={`${WEBSITE_URL}/arena/${room?.id ?? ""}`}
          label="Click to copy room's url"
        />
        <div className="modal-action">
          <button
            className="btn btn-error text-white"
            onClick={() => {
              reset();
            }}
          >
            Close
          </button>
          <button
            className="btn btn-success text-white"
            onClick={() => {
              if (room == null) return;
              push({ pathname: "/arena/[id]", query: { id: room.id } });
            }}
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
};
