import React from "react";
import Link from "next/link";
import {
  gameDifficulties,
  gameDifficultyNames,
} from "utils/services/game/types/game";

function DifficultyButtons() {
  return (
    <div className="flex flex-col md:flex-row">
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
