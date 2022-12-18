import { useEffect, useRef, useState } from "react";

interface Props {
  seconds: number;
  onEnd?: () => boolean;
}

const ProgressRadial = ({ seconds, onEnd }: Props) => {
  const [ticker, setTicker] = useState(seconds);
  const currentTicker = useRef(ticker);
  currentTicker.current = ticker;
  useEffect(() => {
    setTicker(seconds);
    const timer = setInterval(() => {
      currentTicker.current--;
      if (currentTicker.current < 0) {
        const restart = onEnd?.call(undefined);
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
  }, [seconds]);
  return (
    <div
      className="radial-progress my-2 font-bold text-xl"
      style={
        {
          "--value": (100 / seconds) * ticker,
        } as React.CSSProperties
      }
    >
      <span className="countdown">
        <span style={{ "--value": ticker } as React.CSSProperties}></span>
      </span>
    </div>
  );
};

export default ProgressRadial;
