import React, { useEffect, useState, CSSProperties } from "react";

interface Props {
  defaultValue?: number;
}

function GameTimer({ defaultValue }: Props) {
  const [ticker, setTicker] = useState(defaultValue ?? 0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTicker((tick) => tick + 1);
    }, 1000);
    return clearInterval.bind(undefined, timer);
  }, []);
  return (
    <div className="ring bg-base-300 p-4 rounded-full fixed bottom-6 right-6 z-10 countdown font-mono text-4xl">
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