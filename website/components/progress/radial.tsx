import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface Props {
  seconds: number;
  disabled?: boolean;
  onEnd?: () => boolean;
}

const radius = 40;
const circleLength = 2 * radius * Math.PI;

const ProgressRadial = ({ disabled, seconds, onEnd }: Props) => {
  const [ticker, setTicker] = useState(seconds);
  const currentTicker = useRef(ticker);
  currentTicker.current = ticker;

  useEffect(() => {
    if (disabled === true) return setTicker(0);
    setTicker(seconds);
    const timer = setInterval(() => {
      currentTicker.current--;
      if (currentTicker.current < 0) {
        const restart = onEnd?.();
        if (restart === true) {
          setTicker(seconds);
        } else {
          clearInterval(timer);
        }
      } else {
        setTicker(currentTicker.current);
      }
    }, 1000);
    return clearInterval.bind(undefined, timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, disabled]);

  return (
    <div className="relative">
      <svg
        viewBox="0 0 100 100"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        width={100}
        height={100}
      >
        <circle
          cx="50"
          cy="50"
          r={radius}
          strokeWidth={20}
          stroke="white"
          strokeOpacity={0.2}
          fill="transparent"
        />
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          className="origin-center -rotate-90"
          strokeWidth={10}
          stroke="white"
          fill="transparent"
          strokeDasharray={circleLength}
          strokeLinecap={"round"}
          animate={{ strokeDashoffset: (circleLength * ticker) / seconds }}
          transition={{ ease: "easeInOut" }}
        />
      </svg>
      <span className="countdown font-bold text-2xl absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <span style={{ "--value": ticker } as React.CSSProperties}></span>
      </span>
    </div>
  );
};

export default ProgressRadial;
