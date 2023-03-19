import SeparatedInput from "@cmpt/input/separated";
import { useMutation } from "@tanstack/react-query";
import produce from "immer";
import clsx from "classnames";
import React, { useMemo, useRef, useState } from "react";
import { GameService } from "utils/services/game";
import { throttledToast } from "utils/common";

interface Props {
  playerName: string;
  playerID: number;
  onCorrectAnswer?: (answer: string) => void;
  correctionsProp?: string | null;
  isLoadingProp?: boolean;
  onAnswer?: (answer: string) => void;
}

function GameForm({
  playerName,
  playerID,
  onCorrectAnswer,
  isLoadingProp,
  correctionsProp,
  onAnswer,
}: Props) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const words = useMemo(() => playerName.split(" "), [playerName]);
  const [answer, setAnswer] = useState<string[]>(Array(words.length).fill(""));
  const [errorMessage, setErrorMessage] = useState<string>();
  const {
    data: mutationCorrections,
    mutate,
    isLoading: mutationIsLoading,
  } = useMutation({
    mutationFn: async (answer: string) => {
      const { corrections } = await GameService.submitAnswer(playerID, answer);
      if (corrections === null) {
        onCorrectAnswer?.(answer);
        throttledToast("Correct answer", {
          toastId: "correct_answer",
          type: "success",
        });
      } else {
        throttledToast(`Wrong answer`, {
          toastId: "wrong_answer",
          type: "error",
        });
      }
      return corrections;
    },
  });

  const corrections = correctionsProp ?? mutationCorrections;
  const isLoading = isLoadingProp ?? mutationIsLoading;

  return (
    <>
      <div className="flex flex-col w-full items-center overflow-x-auto">
        {words.map((name, index) => (
          <SeparatedInput
            key={index}
            buttonRef={buttonRef}
            length={name.length}
            containerClassName="my-2"
            className="mx-1"
            compare={corrections?.split(" ")[index]}
            onChange={(value: string) => {
              setAnswer(
                produce((draft) => {
                  draft[index] = value;
                })
              );
              const answerString = answer.join(" ");
              if (
                answerString.length !== playerName.length ||
                errorMessage == null
              )
                return;
              setErrorMessage(undefined);
            }}
          />
        ))}
        <div className="text-red-500 h-6">{errorMessage}</div>
      </div>
      <button
        ref={buttonRef}
        className={clsx("btn btn-primary self-center my-2 md:btn-wide", {
          loading: corrections === null,
        })}
        disabled={isLoading || corrections === null}
        onClick={() => {
          const answerString = answer.join(" ");
          if (answerString.length !== playerName.length) {
            return setErrorMessage("Please enter an answer");
          }
          setErrorMessage(undefined);
          if (onAnswer != null) {
            onAnswer(answerString);
          } else {
            mutate(answerString);
          }
        }}
      >
        Submit
      </button>
    </>
  );
}

export default GameForm;
