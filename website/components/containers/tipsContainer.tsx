import { motion } from "framer-motion";
import { AnimationProps } from "framer-motion";
import { SingleTip } from "utils/tips";

interface Props {
  tips: SingleTip[];
}

const container: AnimationProps["variants"] = {
  hidden: {
    transition: {
      duration: 0.2,
    },
  },
  show: {
    transition: {
      staggerChildren: 0.25,
    },
  },
};

const item: AnimationProps["variants"] = {
  hidden: { opacity: 0, scale: 0 },
  show: { opacity: 1, scale: 1 },
};

export default function TipsContainer({ tips }: Props) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={container}
      className="flex-1 grid grid-cols-2 auto-rows-[10rem] w-full gap-4 my-4 overflow-x-hidden overflow-y-auto sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-3"
    >
      {tips.map(({ id, title, text, children }) => (
        <motion.div
          key={id}
          variants={item}
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
        </motion.div>
      ))}
    </motion.div>
  );
}
