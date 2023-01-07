import React, { useEffect, useState } from "react";

function GameTimer() {
  const [ticker, setTicker] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTicker((tick) => tick + 1);
    }, 1000);
    return clearInterval.bind(undefined, timer);
  }, []);
  return (
    <div className="ring bg-base-300 p-4 rounded-full fixed bottom-6 right-6 z-10 countdown font-mono text-4xl">
      <span style={{ "--value": Math.floor(ticker / 3600) } as React.CSSProperties}></span>:
      <span style={{ "--value": Math.floor(ticker / 60) } as React.CSSProperties}></span>:
      <span style={{ "--value": ticker % 60 } as React.CSSProperties}></span>
    </div>
  );
}

export default GameTimer;
