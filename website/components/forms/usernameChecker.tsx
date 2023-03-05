import clsx from "classnames";
import { useEffect, useState } from "react";
import { SessionService } from "utils/services/session";

interface Props {
  username?: string;
}

export default function UsernameChecker({ username }: Props) {
  const [status, setStatus] = useState<
    "loading" | "available" | "not_available" | "error"
  >();

  useEffect(() => {
    if (username == null || username.length < 2) return;
    const [controller, fetch] = SessionService.checkUsername(username);
    fetch
      .then(({ available }) => {
        if (available === true) {
          setStatus("available");
        } else {
          setStatus("not_available");
        }
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setStatus("error");
      });
    return () => controller.abort();
  }, [username]);
  if (username == null || username.length < 2) return null;

  function getStatusText(username: string, status: string | undefined) {
    if (status === "loading") {
      return "Checking...";
    } else if (status === "available") {
      return `${username} is available`;
    } else if (status === "not_available") {
      return `${username} is not available`;
    } else if (status === "error") {
      return "Something went wrong";
    }
    return null;
  }

  return (
    <div
      className={clsx(
        {
          "text-green-400": status === "available",
          "text-red-400": status === "not_available",
        },
        "pt-2"
      )}
    >
      {getStatusText(username, status)}
    </div>
  );
}
