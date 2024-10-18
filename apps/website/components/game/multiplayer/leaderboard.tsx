import React, { useMemo } from "react";
import { PAYLOAD } from "@typ/multiplayer";
import BoltSlash from "@heroicons/react/20/solid/BoltSlashIcon";

interface Props {
  users_progress: PAYLOAD["gameState"]["usersProgress"];
  active_users?: PAYLOAD["activeUsers"];
}

function MultiplayerLeaderboard({ users_progress, active_users }: Props) {
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
          <th>Answered Levels</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(users_progress).map(([key, value]) => (
          <tr key={key}>
            <th>
              <div className="flex gap-2 items-center">
                <div>{key}</div>
                {active_users != null && !active_users.includes(key) && (
                  <div className="tooltip" data-tip="OFFLINE">
                    <button className="btn btn-xs btn-error">
                      <BoltSlash className="h-4 w-4 text-white" />
                    </button>
                  </div>
                )}
              </div>
            </th>
            <td>{value.points}</td>
            <td>
              {winner[1].points > 0 && key === winner[0] && (
                <div className="badge badge-success">Winner</div>
              )}
            </td>
            <td>
              <div className="grid grid-cols-3">
                {value.answers.map((answer) => (
                  <div key={answer.level} className="badge badge-success m-1">
                    {answer.level}
                  </div>
                ))}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default MultiplayerLeaderboard;
