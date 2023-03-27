import React, { useMemo } from "react";
import { PAYLOAD } from "@typ/multiplayer";

interface Props {
  users_progress: PAYLOAD["game_state"]["users_progress"];
}

function MultiplayerLeaderboard({ users_progress }: Props) {
  const winner = useMemo(() => {
    const users = Object.entries(users_progress);
    let maxUser = users[0];
    for (const user of users) {
      if (user[1].points > maxUser[1].points) maxUser = user;
    }
    return maxUser;
  }, [users_progress]);

  return (
    <table className="table w-full">
      <thead>
        <tr>
          <th>Username</th>
          <th>Points</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(users_progress).map(([key, value]) => (
          <tr key={key}>
            <th>{key}</th>
            <td>{value.points}</td>
            <td>
              {winner[1].points > 0 && key === winner[0] && (
                <div className="badge badge-success">Winner</div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default MultiplayerLeaderboard;
