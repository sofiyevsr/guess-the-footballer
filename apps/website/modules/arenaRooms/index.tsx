import clsx from "classnames";
import { RoomForm } from "@cmpt/forms/room";
import { SessionForm } from "@cmpt/forms/session";
import { PublicRooms } from "./publicRooms";
import { MyRooms } from "./myRooms";
import { useState } from "react";
import { useMe } from "utils/hooks/requests/useMe";
import { ArrowPathIcon } from "@heroicons/react/24/solid";
import { globalQueryClient } from "@utils/queryClient";

const ArenaRooms = () => {
  const [currentTab, setCurrentTab] = useState<"public" | "my">("public");
  const { data: user } = useMe();
  return (
    <div className="flex flex-col px-4 lg:px-8">
      <div className="flex flex-col mb-4 lg:flex-row">
        <div className="text-center flex flex-col flex-1 items-center justify-center p-4 rounded-xl rounded-b-none border-2 border-gray-500 w-full lg:rounded-bl-xl lg:rounded-r-none">
          <h1 className="my-4 font-bold text-xl">Multiplayer Mode</h1>
          <p className="prose">
            Multiplayer mode allows players to join or create a room. Every 45
            seconds, players will be asked football player questions based on
            tips. Players can earn points by answering correctly, and the player
            with the highest score wins. It is a fun and engaging way to learn
            more about your favorite players and to challenge your friends to
            see who knows the most.
          </p>
          <div className="w-full h-1 bg-gray-500 my-4 rounded-full" />
          <SessionForm />
        </div>
        <div className="flex flex-1 flex-col justify-around p-8 rounded-xl rounded-t-none border-2 border-gray-500 lg:rounded-tr-xl lg:rounded-l-none">
          <RoomForm />
        </div>
      </div>
      <div>
        <div className="flex items-center gap-4">
          <button
            className="btn btn-square btn-outline btn-sm"
            onClick={() => {
              globalQueryClient.invalidateQueries(["rooms"]);
              globalQueryClient.invalidateQueries(["my_rooms"]);
            }}
          >
            <ArrowPathIcon className="w-5" />
          </button>
          <div className="tabs">
            <a
              className={clsx("tab tab-bordered", {
                "tab-active": currentTab === "public",
              })}
              onClick={() => {
                setCurrentTab("public");
              }}
            >
              Public Rooms
            </a>
            {user != null && (
              <a
                className={clsx("tab tab-bordered", {
                  "tab-active": currentTab === "my",
                })}
                onClick={() => {
                  setCurrentTab("my");
                }}
              >
                My Rooms
              </a>
            )}
          </div>
        </div>
        <div>{currentTab === "public" ? <PublicRooms /> : <MyRooms />}</div>
      </div>
    </div>
  );
};

export default ArenaRooms;
