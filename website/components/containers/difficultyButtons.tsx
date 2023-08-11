import React from "react";
import Link from "next/link";
import clsx from "classnames";
import {
  gameDifficulties,
  gameDifficultyNames,
} from "utils/services/game/types/game";

function DifficultyButtons() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5">
      {gameDifficulties.map((diff, index) => (
        <Link
          key={diff}
          href={`/play/${diff}`}
          className={clsx("btn m-2 normal-case text-xl text-center", {
            "btn-success": index < 2,
            "btn-warning": index === 2,
            "btn-error": index > 2,
            "col-span-2 lg:col-span-1": index === 2,
          })}
        >
          {gameDifficultyNames[diff]}
        </Link>
      ))}
    </div>
  );
}

export default DifficultyButtons;
