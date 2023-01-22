import SeparatedInput from "@cmpt/input/separated";
import { useMutation } from "@tanstack/react-query";
import produce from "immer";
import clsx from "classnames";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import { GameService } from "utils/services/game";

interface Props {
  playerName: string;
  playerID: number;
  onCorrectAnswer?: (answer: string) => void;
}

function GameForm({ playerName, playerID, onCorrectAnswer }: Props) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const words = useMemo(
    () => playerName.split(" ").map((name) => ({ name, id: playerID })),
    [playerName, playerID]
  );
  const [answer, setAnswer] = useState<string[]>(Array(words.length).fill(""));
  const [errorMessage, setErrorMessage] = useState<string>();
  const {
    data: corrections,
    mutate,
    reset,
    isLoading,
  } = useMutation({
    mutationFn: async (answer: string) => {
      const { corrections } = await GameService.submitAnswer(playerID, answer);
      if (corrections === null) {
        onCorrectAnswer?.(answer);
        toast("Correct answer", { toastId: "correct_answer", type: "success" });
      } else {
        toast(`Wrong answer`, { toastId: "wrong_answer", type: "error" });
      }
      return corrections;
    },
  });

  const onChange = useCallback(
    (index: number) => (value: string) => {
      setAnswer(
        produce((draft) => {
          draft[index] = value;
        })
      );
      const answerString = answer.join(" ");
      if (answerString.length !== playerName.length || errorMessage == null)
        return;
      setErrorMessage(undefined);
    },
    [answer, errorMessage, playerName]
  );

  useEffect(() => {
    setAnswer(Array(words.length).fill(""));
    reset();
  }, [words, reset]);

  return (
    <>
      <div className="flex flex-col w-full items-center overflow-x-auto">
        {words.map(({ name, id }, index) => (
          <SeparatedInput
            key={id + "_" + index}
            buttonRef={buttonRef}
            length={name.length}
            containerClassName="my-2"
            className="mx-1"
            compare={corrections?.split(" ")[index]}
            value={answer[index]}
            onChange={onChange(index)}
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
          mutate(answer.join(" "));
        }}
      >
        Submit
      </button>
    </>
  );
}

export default GameForm;
