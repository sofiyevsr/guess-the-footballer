import clsx from "clsx";
import { motion } from "framer-motion";
import React, { PropsWithChildren } from "react";

interface Props extends PropsWithChildren {
  direction: number;
  className?: string;
}

const variants = {
  enter: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
  }),
};

function RevealAnimation({ direction, children, className }: Props) {
  return (
    <motion.div
      custom={direction}
      className={clsx(className)}
      variants={variants}
      transition={{ type: "tween" }}
      initial="enter"
      animate="center"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}

export default RevealAnimation;
