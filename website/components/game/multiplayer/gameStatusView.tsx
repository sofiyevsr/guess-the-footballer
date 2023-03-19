import RocketLaunchIcon from "@heroicons/react/20/solid/RocketLaunchIcon";
import { CONNECTION_STATUS, JOIN_STATUS, Payload } from "@typ/multiplayer";
import Link from "next/link";
import React, { Fragment, ReactNode } from "react";

interface LayoutProps {
  children?: ReactNode;
  loading?: boolean;
}

interface Props {
  connectionStatus: CONNECTION_STATUS;
  joinStatus: JOIN_STATUS;
  gameState: Payload["game_state"] | undefined;
  roomState: Payload["room_state"] | undefined;
}

function GameStatusView({
  connectionStatus,
  joinStatus,
  roomState,
  gameState,
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
  // TODO room state
  if (roomState?.finished_at != null)
    return (
      <Layout loading={false}>
        <span>Game has finished</span>
        {gameState != null && (
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(gameState.users_progress).map(([key, value]) => (
                <Fragment key={key}>
                  <th>{key}</th>
                  <td>{value.points}</td>
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </Layout>
    );

  if (joinStatus === "joining") return <Layout>Joining the room...</Layout>;

  if (joinStatus === "failed_join")
    return (
      <Layout>
        <div>Failed to join the room</div>
        <Link href="/arena" className="btn btn-primary my-4">Go back to rooms</Link>
      </Layout>
    );

  if (gameState == null)
    return <Layout>Waiting to receive game state from server...</Layout>;

  if (gameState.progress == null)
    return (
      <Layout>
        <h1 className="font-bold my-2">Waiting for the room to fill</h1>
        <div className="my-2">
          <span>Current users - </span>
          {gameState.users.map((user) => (
            <span
              key={user}
              className="badge badge-success badge-lg text-lg font-bold uppercase"
            >
              {user}
            </span>
          ))}
        </div>
      </Layout>
    );

  return <Layout>Waiting for the game</Layout>;
}

export default GameStatusView;
