import { motion } from "framer-motion";
import React from "react";

type Props = { width?: number; height?: number };

export default function CompletedIcon({ width = 150, height = 150 }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 150 150"
      width={width}
      height={height}
    >
      <motion.path
        d="M38 74.707l24.647 24.646L116.5 45.5"
        fill="transparent"
        strokeWidth="25"
        className="stroke-blue-500"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
      />
    </svg>
  );
}
