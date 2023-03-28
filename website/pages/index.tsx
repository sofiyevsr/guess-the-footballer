import type { ReactElement } from "react";
import PublicLayout from "@cmpt/layout/public";
import Link from "next/link";
import Image from "next/image";
import { NextSeo } from "next-seo";

const description =
  "Guess the Footballer is an online game that tests your knowledge of the world's top footballers. Players must guess their names from the clues provided. With an intuitive interface and lots of levels to choose from, Guess the Footballer is the ideal game for football fans and puzzle enthusiasts alike. Get ready for a daily dose of football fun! Guess the name of today's player right away!";

function Home() {
  return (
    <>
      <NextSeo title="Today's Challenge" description={description} />
      <section className="flex flex-col items-center lg:mt-8">
        <Image
          src="/player-vector.png"
          alt="football player illustration"
          width={350}
          height={350}
          className="object-contain"
        />
        <h1 className="mx-2 text-center text-md prose my-4 lg:mx-0 lg:max-w-[65%] lg:text-2xl xl:max-w-[50%]">
          {description}
        </h1>
        <Link
          href={"/challenge"}
          className="btn btn-primary text-2xl text-center md:btn-wide"
        >
          Start
        </Link>
      </section>
    </>
  );
}

Home.getLayout = (page: ReactElement) => <PublicLayout>{page}</PublicLayout>;

export default Home;
