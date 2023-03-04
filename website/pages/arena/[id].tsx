import Head from "next/head";
import { ReactElement } from "react";
import PublicLayout from "@cmpt/layout/public";
import { MultiplayerGameView } from "@cmpt/pages/arenaRooms/multiplayerGameView";

function ArenaRoom({}) {
  return (
    <>
      <Head>
        <title>Play</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MultiplayerGameView />
    </>
  );
}

ArenaRoom.getLayout = (page: ReactElement) => (
  <PublicLayout>{page}</PublicLayout>
);

export default ArenaRoom;