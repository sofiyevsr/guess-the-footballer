import React from "react";
import Image from "next/image";
import clsx from "classnames";
import { InView } from "react-intersection-observer";
import { SingleRoom } from "utils/services/arena/types";
import Spinner from "@cmpt/animation/spinner";
import { getRelativeTimeFromUnix } from "utils/common";
import { useMe } from "utils/hooks/requests/useMe";
import { useRouter } from "next/router";
import { STORAGE_URL } from "@utils/constants";
import UserGroupIcon from "@heroicons/react/20/solid/UserGroupIcon";
import ClockIcon from "@heroicons/react/20/solid/ClockIcon";
import UserIcon from "@heroicons/react/24/solid/UserIcon";

interface Props {
  rooms: SingleRoom[];
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  hasNextPage: boolean | undefined;
  className?: string;
}

export default function RoomsView({
  rooms,
  className,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: Props) {
  const { data: user } = useMe();
  const { push } = useRouter();
  return (
    <div
      className={clsx(
        "overflow-x-auto py-4 gap-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4",
        className
      )}
    >
      {rooms.map((room) => (
        <div
          key={room.id}
          className="card bg-base-100 w-full shadow-xl relative"
        >
          <p className="absolute right-4 top-4 flex items-center">
            <UserGroupIcon className="h-8" />
            <span className="mx-2 font-bold">
              {room.currentSize} / {room.size}
            </span>
          </p>
          <figure className="pt-4">
            <Image
              src={STORAGE_URL + "/" + room.list.imageKey}
              alt={room.list.name + " image"}
              height={80}
              width={80}
              className="object-contain bg-white p-1 rounded-lg"
            />
          </figure>
          <div className="card-body items-center text-center pt-4">
            <h2 className="card-title">{room.list.name}</h2>
            <div className="flex gap-2">
              {room.list.official ? (
                <div className="badge badge-primary">Official list</div>
              ) : (
                <div className="badge badge-secondary">Community list</div>
              )}
              {room.private === true ? (
                <div className="badge badge-error">Private</div>
              ) : (
                <div className="badge badge-success">Public</div>
              )}
            </div>
            <ul className="w-full list-disc text-left pl-3">
              <li>
                Number of rounds:
                <span className="badge badge-info ml-2">{room.levels}</span>
              </li>
              <li>
                Interval between new tip:
                <span className="badge badge-info ml-2">
                  {room.tipRevealingInterval} seconds
                </span>
              </li>
              <li>
                Interval between levels:
                <span className="badge badge-info ml-2">
                  {room.durationBetweenLevels} seconds
                </span>
              </li>
            </ul>
            <div className="flex justify-between w-full">
              <div className="flex items-center gap-2 flex-1">
                <UserIcon className="w-6" />
                <span className="font-bold flex-1 text-left">
                  {room.creatorUsername}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="w-6" />
                <span className="font-bold">
                  {getRelativeTimeFromUnix(room.createdAt)}
                </span>
              </div>
            </div>
            <div className="card-actions w-full">
              <button
                disabled={user == null}
                className="btn btn-success w-full"
                onClick={() => {
                  push({ pathname: "/arena/[id]", query: { id: room.id } });
                }}
              >
                Join
              </button>
            </div>
          </div>
        </div>
      ))}
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
