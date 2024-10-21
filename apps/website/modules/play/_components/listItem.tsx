import Image from "next/image";
import { GameListResponse } from "@utils/services/gameList/types";
import React from "react";
import { STORAGE_URL } from "@utils/constants";

interface Props {
  item: GameListResponse["gameLists"][number];
  onClick: (arg0: string) => void;
}

function GameListItem({ item, onClick }: Props) {
  return (
    <div className="card border-4 p-8">
      <figure className="bg-white mb-4 p-4 self-center rounded-lg">
        <Image
          src={STORAGE_URL + "/" + item.imageKey}
          alt={item.name + " image"}
          height={80}
          width={80}
          className="h-20 w-20 object-contain"
        />
      </figure>
      <div className="card-body p-0">
        <h2 className="card-title">{item.name}</h2>
        <p className="text-sm text-primary-content/70 min-h-24 text-ellipsis line-clamp-4">
          {item.description}
        </p>
        <div className="card-actions">
          <button
            onClick={() => onClick(item.id)}
            className="btn btn-outline btn-success w-full"
          >
            Play
          </button>
        </div>
      </div>
    </div>
  );
}

export default GameListItem;
