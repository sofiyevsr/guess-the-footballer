import { ReactNode, useEffect, useState } from "react";
import {
  CalendarDaysIcon,
  PuzzlePieceIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import Link from "next/link";
import { useRouter } from "next/router";
import clsx from "classnames";

interface Props {
  children: ReactNode;
}
const Sidebar = ({ children }: Props) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { pathname } = useRouter();
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);
  return (
    <div className="drawer drawer-mobile">
      <input
        id="sidebar"
        type="checkbox"
        className="drawer-toggle"
        checked={drawerOpen}
        onChange={({ currentTarget: { checked } }) => setDrawerOpen(checked)}
      />
      <div className="drawer-content">{children}</div>
      <div className="drawer-side">
        <label htmlFor="sidebar" className="drawer-overlay" />
        <ul className="menu bg-base-300 p-4 w-90">
          <li>
            <a
              onClick={() => setDrawerOpen(false)}
              className="btn btn-primary drawer-button self-end lg:hidden"
            >
              <XMarkIcon className="h-5 w-5 text-white" />
            </a>
          </li>
          <li className="py-2">
            <Link
              href="/"
              className="btn btn-ghost h-full normal-case text-3xl text-center active:text-white"
            >
              Wordle
            </Link>
          </li>
          <li className="my-1">
            <Link
              className={clsx("flex items-center w-full h-full", {
                "bg-primary": pathname === "/" || pathname === "/challenge",
              })}
              href="/"
            >
              <CalendarDaysIcon className="h-10 w-10 text-red-500" />
              <span className="uppercase ml-3 font-bold text-xl">
                {"Today's challenge"}
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
        </ul>
      </div>
    </div>
  );
};
export default Sidebar;
