import React from "react";
import Link from "next/link";
import {
  gameDifficulties,
  gameDifficultyNames,
} from "utils/services/game/types/game";

function DifficultyButtons() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      {gameDifficulties.map((diff) => (
        <Link
          key={diff}
          href={`/play/${diff}`}
          className="btn btn-primary m-2 normal-case text-xl text-center"
        >
          {gameDifficultyNames[diff]}
        </Link>
      ))}
    </div>
  );
}

export default DifficultyButtons;
