import React, { useEffect, useState, CSSProperties } from "react";

interface Props {
  defaultValue?: number;
}

function GameTimer({ defaultValue }: Props) {
  const [ticker, setTicker] = useState(() => {
    if (defaultValue === 0 || defaultValue == null) return 1;
    return defaultValue;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTicker((tick) => tick + 1);
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
