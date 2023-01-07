import type {
  ChangeEvent,
  HTMLAttributes,
  FocusEvent,
  KeyboardEvent,
} from "react";
import clsx from "classnames";
import { useEffect, useRef, useState } from "react";
import { Transition } from "@headlessui/react";

interface Props {
  length: number;
  className?: HTMLAttributes<HTMLInputElement>["className"];
  containerClassName?: HTMLAttributes<HTMLDivElement>["className"];
  defaultValue?: string;
  value?: string;
  onChange?: (arg0: string) => void;
  compare?: string;
}
const SeparatedInput = ({
  defaultValue = "",
  className,
  containerClassName,
  value,
  onChange,
  length,
  compare,
}: Props) => {
  const [data, setData] = useState(defaultValue);
  const dataRef = useRef<string>(data);
  dataRef.current = data;

  useEffect(() => {
    if (value == null) return;
    setData(value);
  }, [value]);

  useEffect(() => {
    const newData = dataRef.current.substring(0, length);
    setData(newData);
    onChange?.call(undefined, newData);
  }, [length, onChange]);

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const { currentTarget, key } = event;
    const { selectionStart, value } = currentTarget;
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
    onChange?.call(undefined, newData);
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
    <div className={clsx("flex max-w-full", containerClassName)}>
      {new Array(length).fill(0).map((_, index) => (
        <Transition
          key={index}
          appear
          show
          style={{ transitionDelay: `${(index + 1) * 50}ms` }}
          enter="transition-all duration-200"
          enterFrom="opacity-0 translate-x-[-2rem]"
          enterTo="opacity-100 translate-x-0"
          as="input"
          className={clsx(
            "input min-w-[3rem] max-w-[4rem] shrink text-white font-bold border-blue-400 border-2",
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
    </div>
  );
};

export default SeparatedInput;
