import React from "react";
import clsx from "classnames";
import { InView } from "react-intersection-observer";
import { SingleRoom } from "utils/services/arena/types";
import Spinner from "@cmpt/animation/spinner";
import { getRelativeTimeFromUnix } from "utils/common";
import { useMe } from "utils/hooks/requests/useMe";
import { useRouter } from "next/router";
import ArrowPathIcon from "@heroicons/react/20/solid/ArrowPathIcon";
import {
  gameDifficulties,
  gameDifficultyNames,
} from "utils/services/game/types/game";
import classNames from "classnames";

interface Props {
  rooms: SingleRoom[];
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  hasNextPage: boolean | undefined;
  isRefetching: boolean;
  refetch: () => void;
  className?: string;
}

function renderDifficultyBadge(difficulty: (typeof gameDifficulties)[number]) {
  let className = "badge-success";
  if (difficulty === "medium") className = "badge-warning";
  if (difficulty === "hard" || difficulty === "very-hard")
    className = "badge-error";
  return (
    <div className={classNames("badge w-[5rem]", className)}>
      {gameDifficultyNames[difficulty]}
    </div>
  );
}

export default function RoomsTable({
  rooms,
  className,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  refetch,
  isRefetching,
}: Props) {
  const { data: user } = useMe();
  const { push } = useRouter();
  return (
    <div className={clsx("overflow-x-auto", className)}>
      <table className="table w-full">
        <thead>
          <tr>
            <th className="flex justify-center">
              <button
                onClick={refetch}
                data-tip="Refresh"
                className="tooltip tooltip-right btn btn-sm btn-circle p-1"
              >
                <ArrowPathIcon
                  className={clsx({
                    "animate-spin": isRefetching,
                  })}
                />
              </button>
            </th>
            <th>ID</th>
            <th>Creator&apos;s username</th>
            <th>Room size</th>
            <th>Visibility</th>
            <th>Difficulty</th>
            <th>Created at</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room.id}>
              <th>
                <button
                  disabled={user == null}
                  className="btn btn-outline btn-success"
                  onClick={() => {
                    push({ pathname: "/arena/[id]", query: { id: room.id } });
                  }}
                >
                  Join
                </button>
              </th>
              <td>
                <span>{room.id}</span>
              </td>
              <td>
                <span className="font-bold text-xl">{room.creator_username}</span>
              </td>
              <td>
                {room.current_size} / {room.size}
              </td>
              <td>
                {room.private === true ? (
                  <div className="badge badge-error">Private</div>
                ) : (
                  <div className="badge badge-success">Public</div>
                )}
              </td>
              <td>{renderDifficultyBadge(room.difficulty)}</td>
              <td>{getRelativeTimeFromUnix(room.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {hasNextPage === true && (
        <InView
          className="flex justify-center my-2"
          onChange={(inView) => {
            if (
              inView === false ||
              hasNextPage !== true ||
              isFetchingNextPage === true
            )
              return;
            fetchNextPage();
          }}
        >
          <Spinner />
        </InView>
      )}
    </div>
  );
}
