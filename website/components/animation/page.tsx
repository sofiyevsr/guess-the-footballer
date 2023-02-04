import React, { ReactNode } from "react";
import { AnimatePresence, motion, Variant } from "framer-motion";
import { useRouter } from "next/router";

const variants: { [K: string]: Variant } = {
  in: {
    opacity: 1,
    transition: {
      duration: 0.3,
      type: "spring",
      stiffness: 100,
    },
  },
  out: {
    opacity: 0,
    transition: {
      duration: 0.3,
      type: "spring",
      stiffness: 100,
    },
  },
};

interface Props {
  children: ReactNode;
}

function PageTransition({ children }: Props) {
  const { asPath } = useRouter();
  return (
    <AnimatePresence mode="popLayout">
      <motion.main
        className="bg-base-300 py-8 flex-1 lg:border lg:mockup-window h-full"
        key={asPath}
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
