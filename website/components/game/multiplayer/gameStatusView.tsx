import RocketLaunchIcon from "@heroicons/react/20/solid/RocketLaunchIcon";
import { CONNECTION_STATUS, JOIN_STATUS, PAYLOAD } from "@typ/multiplayer";
import Clipboard from "@cmpt/misc/clipboard";
import Link from "next/link";
import React, { ReactNode } from "react";
import { WEBSITE_URL } from "utils/constants";
import MultiplayerLeaderboard from "./leaderboard";

interface LayoutProps {
  children?: ReactNode;
  loading?: boolean;
}

interface Props {
  connectionStatus: CONNECTION_STATUS;
  joinStatus: JOIN_STATUS;
  gameState: PAYLOAD["game_state"] | undefined;
  roomState: PAYLOAD["room_state"] | undefined;
  closeReason?: string;
}

function GameStatusView({
  connectionStatus,
  joinStatus,
  roomState,
  gameState,
  closeReason,
}: Props) {
  function Layout({ children, loading = true }: LayoutProps) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full text-2xl">
        {loading && (
          <div className="animate-bounce my-2">
            <RocketLaunchIcon className="h-24 w-24 text-primary" />
          </div>
        )}
        <div className="text-center">{children}</div>
        {connectionStatus === "closed" && (
          <div className="text-center text-lg text-white p-4 rounded-2xl bg-red-500 fixed bottom-1 lg:text-xl lg:right-1">
            Connection to room is closed
          </div>
        )}
      </div>
    );
  }

  if (roomState?.finished_at != null)
    return (
      <Layout loading={false}>
        <h1 className="text-lg font-bold my-2">Game has finished</h1>
        {gameState != null && (
          <MultiplayerLeaderboard users_progress={gameState.users_progress} />
        )}
        <Link href="/arena" className="btn btn-primary my-4">
          Go back to rooms
        </Link>
      </Layout>
    );

  if (joinStatus === "joining") return <Layout>Joining the room...</Layout>;

  if (joinStatus === "failed_join")
    return (
      <Layout>
        <div>Failed to join the room</div>
        {closeReason && closeReason.trim() !== "" && (
          <div className="text-error">Reason of closure: {closeReason}</div>
        )}
        <Link href="/arena" className="btn btn-primary my-4">
          Go back to rooms
        </Link>
      </Layout>
    );

  if (gameState == null)
    return <Layout>Waiting to receive game state from server...</Layout>;

  if (gameState.progress == null)
    return (
      <Layout>
        <h1 className="font-semibold my-2">
          <span>Waiting for players to start the game</span>
          {roomState && (
            <span>{` (${roomState.current_size} / ${roomState.size}) `}</span>
          )}
        </h1>
        <div className="my-2">
          <span className="text-xl">Users: </span>
          {gameState.users.map((user) => (
            <span
              key={user}
              className="badge badge-success badge-lg text-lg font-bold uppercase"
            >
              {user}
            </span>
          ))}
        </div>
        <div className="my-2">
          <Clipboard
            text={`${WEBSITE_URL}/arena/${roomState?.id ?? ""}`}
            label="Click to copy room's url"
            className="p-2 min-w-[24rem]"
          />
        </div>
      </Layout>
    );

  return <Layout>Waiting for the game</Layout>;
}

export default GameStatusView;
