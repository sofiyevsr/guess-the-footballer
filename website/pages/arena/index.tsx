import Head from "next/head";
import type { ReactElement } from "react";
import PublicLayout from "@cmpt/layout/public";
import ArenaRooms from "@cmpt/pages/arenaRooms";

function Arena() {
  return (
    <>
      <Head>
        <title>Arena</title>
        <meta name="description" content="Play an online football guessing game with other players in real-time and see who can identify the most players correctly in 45 seconds. Put your football knowledge to the test and challenge yourself to guess the names of five footballers in record time. With a range of clues and tips provided for each player, you'll need to be quick on your feet to outscore your opponents. Perfect for football fans of all levels, this multiplayer game is a fun and exciting way to engage with other players and enjoy a friendly competition" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ArenaRooms />
    </>
  );
}

Arena.getLayout = (page: ReactElement) => <PublicLayout>{page}</PublicLayout>;

export default Arena;
