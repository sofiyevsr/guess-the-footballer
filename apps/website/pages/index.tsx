import type { ReactElement } from "react";
import PublicLayout from "@cmpt/layout/public";
import Link from "next/link";
import Image from "next/image";
import { NextSeo } from "next-seo";
import CalendarDaysIcon from "@heroicons/react/20/solid/CalendarDaysIcon";
import PuzzlePieceIcon from "@heroicons/react/20/solid/PuzzlePieceIcon";
import UserGroupIcon from "@heroicons/react/20/solid/UserGroupIcon";

const description =
  "Guess the Footballer is an online game that tests your knowledge of the world's top footballers. Players must guess their names from the clues revealed every 3 seconds. With an intuitive interface and lots of levels to choose from, Guess the Footballer is the ideal game for football fans and puzzle enthusiasts alike. Get ready for a daily dose of football fun!";

function Home() {
  return (
    <>
      <NextSeo title="The Ultimate Footballer Quiz" description={description} />
      <section className="flex flex-col items-center lg:mt-8">
        <Image
          src="/player-vector.png"
          alt="football player illustration"
          width={350}
          height={350}
          className="px-8 object-contain"
        />
        <h1 className="mx-4 text-center text-md prose my-4 lg:mx-0 lg:max-w-[60%] lg:text-2xl xl:max-w-[45%]">
          {description}
        </h1>
        <div className="flex flex-col items-stretch">
          <Link
            href="/challenges"
            className="btn btn-outline btn-error text-xl m-4 justify-start"
          >
            <CalendarDaysIcon className="h-10 w-10 text-red-500" />
            <span>PLAY DAILY CHALLENGES</span>
          </Link>
          <Link
            href="/play"
            className="btn btn-outline btn-success text-xl justify-start m-4"
          >
            <PuzzlePieceIcon className="h-10 w-10 text-green-500" />
            <span>PLAY LOCAL MODE</span>
          </Link>
          <Link
            href="/arena"
            className="btn btn-outline btn-warning text-xl justify-start m-4"
          >
            <UserGroupIcon className="h-10 w-10 text-yellow-500" />
            <span>PLAY MULTIPLAYER MODE</span>
          </Link>
        </div>
      </section>
    </>
  );
}

Home.getLayout = (page: ReactElement) => <PublicLayout>{page}</PublicLayout>;

export default Home;
