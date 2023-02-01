import Head from "next/head";
import type { ReactElement } from "react";
import PublicLayout from "@cmpt/layout/public";
import DifficultyButtons from "@cmpt/containers/difficultyButtons";
import { Lottie } from "@cmpt/misc/Lottie";

function PreLocalPlay() {
  return (
    <>
      <Head>
        <title>Play</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className="flex flex-col justify-center items-center">
        <Lottie path="/tactic.json" className="h-80 w-auto" loop />
        <h1 className="relative -top-8 mx-2 text-center text-lg my-4 lg:mx-0 lg:max-w-[65%] lg:text-2xl xl:max-w-[50%]">
          On this page, you&apos;ll be able to select from a range of difficulty
          levels, each containing 10 players to guess. Questions for each
          difficulty update every 5 minutes. As you progress, the players will
          become less well-known and have lower market value. So, are you ready
          to challenge yourself and become a football trivia master? Pick a
          difficulty level and get ready to play. Good luck!
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
