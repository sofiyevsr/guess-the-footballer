import React, { useEffect, useState, CSSProperties, useMemo } from "react";

interface Props {
  defaultValue?: number;
  countdownTimer?: number;
}

function GameTimer({ defaultValue, countdownTimer }: Props) {
  const [defaultTicker, setDefaultTicker] = useState(() => {
    if (defaultValue === 0 || defaultValue == null) return 1;
    return defaultValue;
  });

  const ticker = useMemo(() => {
    if (!countdownTimer) return defaultTicker;
    return Math.max(countdownTimer - defaultTicker, 0);
  }, [countdownTimer, defaultTicker]);

  useEffect(() => {
    const timer = setInterval(() => {
      setDefaultTicker((tick) => tick + 1);
    }, 1000);
    return clearInterval.bind(undefined, timer);
  }, []);

  return (
    <div className="ring bg-base-300 p-3 rounded-full fixed bottom-6 right-4 z-10 countdown text-lg font-mono font-bold md:text-2xl">
      <span style={{ "--value": Math.floor(ticker / 3600) } as CSSProperties} />
      <>:</>
      <span
        style={{ "--value": Math.floor(ticker / 60) % 60 } as CSSProperties}
      />
      <>:</>
      <span style={{ "--value": ticker % 60 } as CSSProperties} />
    </div>
  );
}

export default GameTimer;
