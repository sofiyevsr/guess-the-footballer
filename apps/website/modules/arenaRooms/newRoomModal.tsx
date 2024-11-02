import React from "react";
import { SingleRoom } from "utils/services/arena/types";
import Clipboard from "@cmpt/misc/clipboard";
import { useRouter } from "next/router";
import { WEBSITE_URL } from "utils/constants";
import {
  DialogPanel,
  DialogTitle,
  Dialog,
  DialogBackdrop,
} from "@headlessui/react";

interface Props {
  room: SingleRoom | undefined;
  reset: () => void;
}

export const NewRoomModal = ({ room, reset }: Props) => {
  const { push } = useRouter();
  return (
    <Dialog
      open={room != null}
      onClose={() => reset()}
      className="relative z-50"
    >
      <DialogBackdrop className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex w-screen items-center justify-center">
        <DialogPanel className="mx-8 w-[32rem] bg-base-200 p-8 rounded-xl">
          <DialogTitle className="font-bold">
            You have created a new room successfully
          </DialogTitle>
          <p className="py-4">Do you want to join the room now?</p>
          <Clipboard
            text={`${WEBSITE_URL}/arena/${room?.id ?? ""}`}
            label="Click to copy room's url"
          />
          <div className="flex gap-2 justify-end mt-4">
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
        </DialogPanel>
      </div>
    </Dialog>
  );
};
