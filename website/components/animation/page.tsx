import React, { ReactNode } from "react";
import { AnimatePresence, motion, Variant } from "framer-motion";
import { useRouter } from "next/router";

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
    scale: .8,
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
  const { asPath } = useRouter();
  return (
    <AnimatePresence mode="popLayout">
      <motion.main
        className="bg-base-300 py-8 flex-1 overflow-auto rounded-2xl lg:border"
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
