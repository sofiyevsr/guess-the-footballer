import React, { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";

const variants = {
  center: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
    },
  },
  in: {
    opacity: 0,
    x: "100%",
    transition: {
      duration: 0.5,
    },
  },
  out: {
    opacity: 0,
    x: "-100%",
    transition: {
      duration: 0.5,
    },
  },
};

interface Props {
  children: ReactNode;
}

function PageTransition({ children }: Props) {
  const { asPath } = useRouter();
  return (
    <AnimatePresence initial={false} mode="popLayout">
      <motion.div
        className="h-full"
        key={asPath}
        variants={variants}
        initial="in"
        animate="center"
        exit="out"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
export default PageTransition;
