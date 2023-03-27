import type { ReactElement } from "react";
import PublicLayout from "@cmpt/layout/public";
import DifficultyButtons from "@cmpt/containers/difficultyButtons";
import { Lottie } from "@cmpt/misc/lottie";
import { NextSeo } from "next-seo";

const description =
  "On this page, you'll be able to select from a range of difficulty levels, each containing 10 players to guess. Questions for each difficulty update every 5 minutes. As you progress, the players will become less well-known and have lower market value. So, are you ready to challenge yourself and become a football trivia master? Pick a difficulty level and get ready to play. Good luck!";

function PreLocalPlay() {
  return (
    <>
      <NextSeo title="Play" description={description} />
      <section className="flex flex-col justify-center items-center">
        <Lottie path="/tactic.json" className="h-80 w-auto" loop />
        <h1 className="relative -top-8 mx-2 text-center text-lg prose my-2 lg:mx-0 lg:max-w-[65%] lg:text-2xl xl:max-w-[50%]">
          {description}
        </h1>
        <DifficultyButtons />
      </section>
    </>
  );
}

PreLocalPlay.getLayout = (page: ReactElement) => (
  <PublicLayout>{page}</PublicLayout>
);

export default PreLocalPlay;
