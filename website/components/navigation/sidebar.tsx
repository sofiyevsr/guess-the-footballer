import { ReactNode, useEffect, useState } from "react";
import CalendarDaysIcon from "@heroicons/react/20/solid/CalendarDaysIcon";
import PuzzlePieceIcon from "@heroicons/react/20/solid/PuzzlePieceIcon";
import UserGroupIcon from "@heroicons/react/20/solid/UserGroupIcon";
import XMarkIcon from "@heroicons/react/20/solid/XMarkIcon";
import Link from "next/link";
import { useRouter } from "next/router";
import clsx from "classnames";
import { LastDBUpdate } from "@cmpt/misc/lastDBUpdate";

interface Props {
  children: ReactNode;
}
const Sidebar = ({ children }: Props) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { events, pathname } = useRouter();
  useEffect(() => {
    const handleStart = () => {
      setDrawerOpen(false);
    };
    events.on("routeChangeStart", handleStart);
    return () => {
      events.off("routeChangeStart", handleStart);
    };
  }, [events]);
  return (
    <div className="drawer lg:drawer-open">
      <input
        id="sidebar"
        type="checkbox"
        className="drawer-toggle"
        checked={drawerOpen}
        onChange={({ currentTarget: { checked } }) => setDrawerOpen(checked)}
      />
      <div className="min-h-[100vh] drawer-content flex flex-col overflow-auto">
        {children}
      </div>
      <div className="drawer-side">
        <label htmlFor="sidebar" className="drawer-overlay" />
        <ul className="menu bg-base-300 p-4 w-90 min-h-full flex-nowrap">
          <li>
            <a
              onClick={() => setDrawerOpen(false)}
              className="btn btn-primary drawer-button self-end lg:hidden"
            >
              <XMarkIcon className="h-7 w-7 text-white" />
            </a>
          </li>
          <li className="py-2">
            <Link
              href="/"
              className="btn btn-ghost h-full normal-case text-3xl text-center active:text-white"
            >
              Guess the Footballer
            </Link>
          </li>
          <li className="my-1">
            <Link
              className={clsx("flex items-center w-full h-full", {
                "bg-primary": pathname === "/challenge",
              })}
              href="/challenge"
            >
              <CalendarDaysIcon className="h-10 w-10 text-red-500" />
              <span className="uppercase ml-3 font-bold text-xl">
                Today&apos;s challenge
              </span>
            </Link>
          </li>
          <li className="my-1">
            <Link
              className={clsx("flex items-center w-full h-full", {
                "bg-primary": pathname.startsWith("/play"),
              })}
              href="/play"
            >
              <PuzzlePieceIcon className="h-10 w-10 text-green-500" />
              <span className="uppercase ml-3 font-bold text-xl">Play</span>
            </Link>
          </li>
          <li className="my-1">
            <Link
              className={clsx("flex items-center w-full h-full", {
                "bg-primary": pathname.startsWith("/arena"),
              })}
              href="/arena"
            >
              <UserGroupIcon className="h-10 w-10 text-yellow-500" />
              <span className="uppercase ml-3 font-bold text-xl">
                Multiplayer
              </span>
            </Link>
          </li>
          <div className="flex-1" />
          <LastDBUpdate />
          <div className="my-2 flex justify-between items-center font-bold">
            <h1 className="block font-bold text-md">Contact: </h1>
            <a className="link" href="mailto:guessfootballerapp@gmail.com">
              guessfootballerapp@gmail.com
            </a>
          </div>
        </ul>
      </div>
    </div>
  );
};
export default Sidebar;
