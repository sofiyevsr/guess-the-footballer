import React, { useState } from "react";
import clsx from "classnames";
import { useRouter } from "next/router";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";

interface Props {
  listID: string | undefined;
  setListID: (arg0: string | undefined) => void;
}

const options = new Array(6).fill(undefined).map((_, index) => {
  return { value: index * 5 + 5, label: index * 5 + 5 };
});

export const PlaySettingsModal = ({ listID, setListID }: Props) => {
  const { push } = useRouter();
  const [rounds, setRounds] = useState<string>();
  const [roundsError, setRoundsError] = useState(false);

  function onClose() {
    setRoundsError(false);
    setRounds(undefined);
    setListID(undefined);
  }

  return (
    <Dialog
      open={listID != null}
      onClose={() => onClose()}
      className="relative z-50"
    >
      <DialogBackdrop className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex w-screen items-center justify-center">
        <DialogPanel className="mx-8 w-[32rem] bg-base-200 p-8 rounded-xl">
          <label className="font-bold text-lg">Pick the number of rounds</label>
          <select
            className={clsx("mt-4 select select-bordered w-full max-w-xs", {
              "select-error": roundsError,
            })}
            onChange={(e) => {
              setRoundsError(false);
              setRounds(e.currentTarget.value);
            }}
            defaultValue="default"
          >
            <option disabled value="default">
              Number of rounds
            </option>
            {options.map((option) => (
              <option key={option.value}>{option.label}</option>
            ))}
          </select>
          <div className="modal-action">
            <button className="btn btn-error text-white" onClick={onClose}>
              Close
            </button>
            <button
              className="btn btn-success text-white"
              onClick={() => {
                if (listID == null) return;
                if (rounds == null) return setRoundsError(true);
                push({
                  pathname: "/play/view",
                  search: `listID=${listID}&rounds=${rounds}`,
                });
              }}
            >
              START
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};
