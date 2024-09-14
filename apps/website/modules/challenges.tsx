import { useQuery } from "@tanstack/react-query";
import { GameService } from "@utils/services/game";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { CheckIcon } from "@heroicons/react/24/solid";
import dayjs from "dayjs";
import clsx from "clsx";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import { getSolvedChallengesFromStorage } from "@utils/storage";

function Challenges() {
  const [months, setMonths] = useState(() => {
    const unixEpoch = dayjs.unix(0).utc();
    const now = dayjs.utc();
    return now.diff(unixEpoch, "months");
  });

  const { data: challenges, isLoading } = useQuery({
    queryKey: ["challenges", months],
    queryFn: () => {
      const date = dayjs.unix(0).utc().add(months, "months");
      return GameService.getChallengesByMonth(date.month(), date.year());
    },
  });

  const solvedChallenges = useMemo(() => {
    return getSolvedChallengesFromStorage();
  }, []);

  const monthData = useMemo(() => {
    const date = dayjs.unix(0).utc().add(months, "months");
    const daysInMonth = date.daysInMonth();
    const data = Array.from(new Array(daysInMonth)).map((_, index) => {
      const day = index + 1;
      const data = challenges?.find((c) =>
        dayjs(c.createdAt).isSame(date.add(day, "days"), "day")
      );
      return {
        day,
        data,
        isSolved: data ? solvedChallenges.has(data.id) : false,
      };
    });
    return data;
  }, [months, challenges]);

  return (
    <div className="flex flex-col min-h-full items-center justify-center">
      <div className="flex items-center gap-4">
        <button
          className="btn btn-circle p-3"
          onClick={() => setMonths((month) => month - 1)}
        >
          <ChevronLeftIcon />
        </button>
        <h1 className="font-bold prose-xl md:prose-4xl">
          {dayjs.unix(0).add(months, "months").format("MMMM YYYY")}
        </h1>
        <button
          className="btn btn-circle p-3"
          disabled={dayjs
            .unix(0)
            .add(months, "months")
            .set("day", monthData.length)
            .isAfter(dayjs())}
          onClick={() => setMonths((month) => month + 1)}
        >
          <ChevronRightIcon />
        </button>
      </div>
      <div className="my-1 h-2">
        {isLoading && <progress className="progress w-32 h-full" />}
      </div>
      <div className="grid grid-cols-8 my-8 gap-4">
        {monthData.map(({ day, data, isSolved }) => (
          <Link
            key={day}
            className={clsx("relative btn btn-outline btn-success size-24", {
              "btn-disabled": !data || isLoading,
            })}
            href={"/challenge/" + (data?.id ?? "")}
          >
            <span className={clsx("text-lg", { "text-gray-600": isSolved })}>
              {day}
            </span>
            {isSolved && (
              <div className="absolute top-0 bottom-0 left-0 right-0 bg-success/5 flex items-center justify-center">
                <CheckIcon className="w-8" />
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Challenges;
