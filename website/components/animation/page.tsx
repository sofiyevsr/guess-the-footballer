import React, { ReactNode } from "react";
import { AnimatePresence, motion, Variant } from "framer-motion";

const variants: { [K: string]: Variant } = {
  in: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.25,
      ease: "backIn",
    },
  },
  out: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.25,
      ease: "backOut",
    },
  },
};

interface Props {
  children: ReactNode;
}

function PageTransition({ children }: Props) {
  const pathname =
    typeof window !== "undefined" ? window.location.pathname : undefined;

  return (
    <AnimatePresence mode="popLayout">
      <motion.main
        className="bg-base-300 py-4 flex-1 overflow-auto rounded-2xl lg:border"
        key={pathname}
        variants={variants}
        initial="out"
        animate="in"
        exit="out"
      >
        {children}
      </motion.main>
    </AnimatePresence>
  );
}
export default PageTransition;
