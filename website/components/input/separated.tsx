import {
  ChangeEvent,
  HTMLAttributes,
  FocusEvent,
  KeyboardEvent,
  RefObject,
} from "react";
import clsx from "classnames";
import { useState } from "react";
import { AnimationProps, motion } from "framer-motion";

interface Props {
  length: number;
  className?: HTMLAttributes<HTMLInputElement>["className"];
  containerClassName?: HTMLAttributes<HTMLDivElement>["className"];
  defaultValue?: string;
  onChange?: (arg0: string) => void;
  compare?: string;
  buttonRef?: RefObject<HTMLButtonElement>;
  firstInputRef?: RefObject<HTMLInputElement>;
}

const container: AnimationProps["variants"] = {
  hidden: {
    transition: {
      duration: 0.2,
    },
  },
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item: AnimationProps["variants"] = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
};

const SeparatedInput = ({
  defaultValue = "",
  className,
  containerClassName,
  onChange,
  length,
  compare,
  buttonRef,
  firstInputRef,
}: Props) => {
  const [data, setData] = useState(defaultValue);

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const { currentTarget, key } = event;
    const { selectionStart, value } = currentTarget;
    const isEnter = key === "Enter";
    const isBackspace = key === "Backspace" || key === "Delete";
    const isBack = key === "ArrowLeft" || key === "ArrowDown";
    const isForward = key === "ArrowRight" || key === "ArrowUp";
    if (value === "" && selectionStart === 0 && isBackspace) {
      focusPreviousElement(currentTarget);
      event.preventDefault();
    }
    // Move cursor to previous if left arrow pressed on the start of input
    if (selectionStart === 0 && isBack) {
      focusPreviousElement(currentTarget);
      event.preventDefault();
    }
    // Move cursor to next if right arrow pressed on the end of input
    if (selectionStart === 1 && isForward) {
      focusNextElement(currentTarget);
      event.preventDefault();
    }
    // Move cursor if current key press is same as input text
    if (value === key) {
      focusNextElement(currentTarget);
      event.preventDefault();
    }
    // Click submit button if enter received
    if (isEnter && buttonRef) {
      buttonRef.current?.click();
      event.preventDefault();
    }
  }

  function onFocus(event: FocusEvent<HTMLInputElement>) {
    const { currentTarget } = event;
    let prev = currentTarget.previousElementSibling as HTMLInputElement | null;
    if (prev != null && prev.value === "") {
      return prev.focus();
    }
    if (currentTarget.value !== "") {
      return currentTarget.setSelectionRange(0, 1);
    }
  }

  function onValueChange(event: ChangeEvent<HTMLInputElement>, index: number) {
    const { currentTarget } = event;
    const { value } = currentTarget;
    let newData = data;
    if (index >= newData.length) {
      newData += " ";
    }
    const arr = newData.split("");
    arr[index] = value;
    newData = arr.join("");
    setData(newData);
    onChange?.(newData);
    if (value === "") {
      focusPreviousElement(currentTarget);
    } else {
      focusNextElement(currentTarget);
    }
  }

  function focusElement(element: Element | null) {
    return (element as HTMLInputElement | null)?.focus();
  }

  function focusPreviousElement(current: HTMLInputElement) {
    const { previousElementSibling, parentElement } = current;
    if (previousElementSibling != null)
      return focusElement(previousElementSibling);
    const previousChild =
      parentElement?.previousElementSibling?.lastElementChild;
    if (previousChild == null || previousChild.tagName !== "INPUT") return;
    return focusElement(previousChild);
  }

  function focusNextElement(current: HTMLInputElement) {
    const { nextElementSibling, parentElement } = current;
    if (nextElementSibling != null) return focusElement(nextElementSibling);
    const nextChild = parentElement?.nextElementSibling?.firstElementChild;
    if (nextChild == null || nextChild.tagName !== "INPUT") return;
    return focusElement(nextChild);
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={container}
      className={clsx("flex max-w-full", containerClassName)}
    >
      {new Array(length).fill(0).map((_, index) => (
        <motion.input
          key={index}
          ref={index === 0 ? firstInputRef : undefined}
          variants={item}
          className={clsx(
            "input p-0 h-12 w-10 text-white text-center font-bold border-blue-400 border-2 sm:w-14 sm:h-16 lg:text-2xl",
            {
              "border-red-500": compare?.charAt(index) === "*",
              "border-green-500":
                compare?.charAt(index) != null &&
                compare?.charAt(index) !== "*",
            },
            className
          )}
          maxLength={1}
          value={data.charAt(index)}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onValueChange(event, index)
          }
        />
      ))}
    </motion.div>
  );
};

export default SeparatedInput;
