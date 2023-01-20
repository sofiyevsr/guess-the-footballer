import { FadeIn } from "@cmpt/animation/fadeIn";
import { ReactNode } from "react";

interface Props {
  title: string;
  children?: ReactNode;
  text?: ReactNode;
}

function TipCard({ title, children, text }: Props) {
  return (
    <FadeIn
      duration={.3}
      className="card bg-base-100 px-4 text-center items-center"
    >
      <h1 className="mt-2 font-bold">{title}</h1>
      <div className="relative text-2xl w-full h-full">
        {children}
        {text != null && (
          <div className="text-white font-bold w-full absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {text}
          </div>
        )}
      </div>
    </FadeIn>
  );
}

export default TipCard;
