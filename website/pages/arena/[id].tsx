import { ReactElement } from "react";
import PublicLayout from "@cmpt/layout/public";
import { MultiplayerGameView } from "@cmpt/pages/arenaRooms/multiplayerGameView";
import { NextSeo } from "next-seo";

function ArenaRoom() {
  return (
    <>
      <NextSeo noindex />
      <MultiplayerGameView />
    </>
  );
}

ArenaRoom.getLayout = (page: ReactElement) => (
  <PublicLayout>{page}</PublicLayout>
);

export default ArenaRoom;
