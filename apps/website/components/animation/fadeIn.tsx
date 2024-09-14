import { motion } from "framer-motion";
import React, { ReactNode } from "react";

interface Props {
  children: ReactNode;
  duration?: number;
  className?: HTMLDivElement["className"];
}

export const FadeIn = ({ children, duration, className }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: .4 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
