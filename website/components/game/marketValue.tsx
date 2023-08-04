import React, { useEffect, useState } from "react";
import { getMarketValueArray } from "utils/tips";
import { motion } from "framer-motion";
import DownIcon from "@heroicons/react/20/solid/PaperAirplaneIcon";

interface Props {
  marketValue: number;
}

const tipDuration = 5;

function MarketValueLine({ marketValue }: Props) {
  const [range, setRange] = useState<[number, number]>(() =>
    getMarketValueArray(marketValue)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setRange((range) => getMarketValueArray(marketValue, range));
    }, tipDuration * 1000);
    return clearInterval.bind(undefined, timer);
  }, []);

  const isTooClose = range[1] - range[0] < 12.5;
  const left = isTooClose ? marketValue : range[0];
  const right = isTooClose ? marketValue : range[1];
  return (
    <div className="my-4 w-full text-center">
      <h1 className="font-bold text-xl mb-2">Market Value</h1>
      <div className="relative">
        <motion.div
          className="absolute"
          initial={{ left: "-16px" }}
          animate={{ left: `calc(${left / 2}% - 16px)` }}
        >
          <p className="h-4 font-bold translate-x-[-15%]">{left}M €</p>
          <DownIcon className="h-10 w-8 text-red-500 rotate-90" />
        </motion.div>
        <motion.div
          className="absolute"
          initial={{ left: "calc(100% - 16px)" }}
          animate={{ left: `calc(${right / 2}% - 16px)` }}
        >
          <p className="h-4 font-bold translate-x-[-15%]">{right}M €</p>
          <DownIcon className="h-10 w-8 text-green-500 rotate-90" />
        </motion.div>
        <div className="h-14 w-full" />
      </div>
      <div className="relative h-2">
        <div className="absolute top-[25%] h-1 w-full bg-white" />
        <motion.div
          animate={{ width: `${(right - left) / 2}%`, left: `${left / 2}%` }}
          className="absolute h-2 w-full bg-red-500 rounded-3xl"
        />
      </div>
      <div className="flex justify-between">
        <h6 className="font-semibold text-md">1M €</h6>
        <h6 className="font-semibold text-md">200M €</h6>
      </div>
    </div>
  );
}

export default MarketValueLine;
