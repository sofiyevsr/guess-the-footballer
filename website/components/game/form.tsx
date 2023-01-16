import SeparatedInput from "@cmpt/input/separated";
import { useMutation } from "@tanstack/react-query";
import produce from "immer";
import clsx from "classnames";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { GameService } from "utils/services/game";

interface Props {
  playerName: string;
  playerID: number;
  onCorrectAnswer?: (answer: string) => void;
}

function GameForm({ playerName, playerID, onCorrectAnswer }: Props) {
  const words = playerName.split(" ");
  const [answer, setAnswer] = useState(Array(words.length).fill(""));
  const [errorMessage, setErrorMessage] = useState<string>();
  const {
    data: corrections,
    mutate,
    isLoading,
  } = useMutation({
    mutationFn: async (answer: string) => {
      const { corrections } = await GameService.submitAnswer(playerID, answer);
      if (corrections === null) {
        onCorrectAnswer?.(answer);
        toast("Correct answer", { type: "success" });
      } else {
        toast(`Wrong answer`, { type: "error" });
      }
      return corrections;
    },
  });

  useEffect(() => {
    setAnswer(Array(words.length).fill(""));
  }, [playerName]);

  return (
    <>
      <div className="flex flex-col w-full items-center overflow-x-auto">
        {words.map((name, index) => (
          <SeparatedInput
            key={index}
            length={name.length}
            containerClassName="my-2"
            className="mx-1"
            compare={corrections?.split(" ")[index]}
            onChange={(value) => {
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
        className={clsx("btn btn-wide btn-primary self-center my-2", {
          loading: corrections === null,
        })}
        disabled={isLoading || corrections === null}
        onClick={() => {
          const answerString = answer.join(" ");
          if (answerString.length !== playerName.length) {
            return setErrorMessage("Please enter an answer");
          }
          setErrorMessage(undefined);
          mutate(answer.join(" "));
        }}
      >
        Submit
      </button>
    </>
  );
}

export default GameForm;
