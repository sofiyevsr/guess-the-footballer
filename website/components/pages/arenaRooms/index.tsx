import clsx from "classnames";
import { RoomForm } from "@cmpt/forms/room";
import { SessionForm } from "@cmpt/forms/session";
import { PublicRooms } from "./publicRooms";
import { MyRooms } from "./myRooms";
import { useState } from "react";
import { useMe } from "utils/hooks/requests/useMe";

const ArenaRooms = () => {
  const [currentTab, setCurrentTab] = useState<"public" | "my">("public");
  const { data: user } = useMe();
  return (
    <div className="flex flex-col px-4 lg:px-8">
      <div className="flex flex-col mb-4 gap-4 lg:flex-row">
        <div className="flex flex-col flex-1 items-center justify-center p-4 max-w-lg rounded-xl outline outline-primary outline-4 md:flex-row">
          <SessionForm />
          <div className="self-stretch bg-white h-0.5 my-4 rounded-xl md:h-auto md:my-0 md:mx-4 md:w-0.5" />
          <RoomForm />
        </div>
        <div className="text-center flex flex-col flex-1 items-center p-4 max-w-lg rounded-xl outline outline-primary outline-4">
          <h1 className="my-4 font-bold text-xl">Multiplayer Mode</h1>
          <p className="prose">
            Multiplayer mode allows players to join or create a room. Every 45
            seconds, players will be asked football player questions based on
            tips. Players can earn points by answering correctly, and the player
            with the highest score wins. It is a fun and engaging way to learn
            more about your favorite players and to challenge your friends to
            see who knows the most
          </p>
        </div>
      </div>
      <div>
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
        <div>{currentTab === "public" ? <PublicRooms /> : <MyRooms />}</div>
      </div>
    </div>
  );
};

export default ArenaRooms;
