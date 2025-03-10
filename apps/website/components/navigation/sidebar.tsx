import { ReactNode, useEffect, useState } from "react";
import CalendarDaysIcon from "@heroicons/react/20/solid/CalendarDaysIcon";
import PuzzlePieceIcon from "@heroicons/react/20/solid/PuzzlePieceIcon";
import UserGroupIcon from "@heroicons/react/20/solid/UserGroupIcon";
import XMarkIcon from "@heroicons/react/20/solid/XMarkIcon";
import Link from "next/link";
import { useRouter } from "next/router";
import clsx from "classnames";
import { InboxStackIcon } from "@heroicons/react/24/solid";

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
              className="btn btn-ghost h-full normal-case text-2xl text-center underline decoration-dashed active:text-white"
            >
              Guess The Footballer
            </Link>
          </li>
          <li className="my-1">
            <Link
              className={clsx("flex items-center w-full h-full", {
                "bg-primary": pathname === "/challenge",
              })}
              href="/challenges"
            >
              <CalendarDaysIcon className="h-10 w-10 text-red-500" />
              <span className="uppercase ml-3 font-bold text-xl">
                Daily challenges
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
          <div className="my-2 font-bold">
            <Link
              href="/submit-list"
              className="link link-hover flex justify-center items-center gap-2 text-xl text-center w-full"
            >
              <InboxStackIcon className="h-8 w-8 text-blue-500" />
              <span>Submit list</span>
            </Link>
          </div>
          <div className="my-2 flex justify-between items-center font-bold">
            <p className="block font-bold text-md">Contact: </p>
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
