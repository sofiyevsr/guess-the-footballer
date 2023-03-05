import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { API_DOMAIN } from "utils/constants";

export const MultiplayerGameView = () => {
  const {
    query: { id },
    isReady,
  } = useRouter();
  const socketRef = useRef<WebSocket>();
  const [message, setMessage] = useState("message");
  useEffect(() => {
    if (isReady === false || socketRef.current != null) return;
    // TODO WIP
    console.log("called");
    socketRef.current = new WebSocket(`ws://${API_DOMAIN}/arena/join/${id}`);
    socketRef.current.onerror = (e) => {
      console.log("error: ", e);
    };
    socketRef.current.onopen = (e) => {
      console.log("open: ", e);
    };
    socketRef.current.onclose = (e) => {
      delete socketRef.current;
      console.log("close: ", e);
    };
    socketRef.current.onmessage = (e) => {
      setMessage(e.data);
    };
    return () => {
      socketRef.current?.close();
    };
  }, [isReady]);
  return <div>{message}</div>;
};
