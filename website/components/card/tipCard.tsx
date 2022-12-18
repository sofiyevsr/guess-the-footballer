import { Transition } from "@headlessui/react";
import { ReactNode } from "react";

interface Props {
  title: string;
  children?: ReactNode;
  text?: ReactNode;
}

function TipCard({ title, children, text }: Props) {
  return (
    <Transition
      show
      appear
      enter="transition-all duration-300"
      enterFrom="opacity-0 scale-75"
      enterTo="opacity-100 scale-100"
      className="card bg-base-100 px-4 w-30 text-center items-center sm:w-40"
    >
      <h1 className="my-2 font-bold">{title}</h1>
      <div className="relative text-2xl w-full h-full my-2">
        {children}
        {text != null && (
          <div className="text-white font-bold w-full absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {text}
          </div>
        )}
      </div>
    </Transition>
  );
}

export default TipCard;
