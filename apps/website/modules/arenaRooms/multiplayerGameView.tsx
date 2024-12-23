import GameForm from "@cmpt/game/form";
import GameStatusView from "@cmpt/game/multiplayer/gameStatusView";
import MultiplayerLeaderboard from "@cmpt/game/multiplayer/leaderboard";
import GameView from "@cmpt/game/view";
import type { CONNECTION_STATUS, JOIN_STATUS, PAYLOAD } from "@typ/multiplayer";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { throttledToast } from "utils/common";
import { API_WS } from "utils/constants";
import { useMe } from "utils/hooks/requests/useMe";

const HEARTBEAT_INTERVAL = 10000;

export const MultiplayerGameView = () => {
  const {
    query: { id },
    isReady,
  } = useRouter();
  const socketRef = useRef<WebSocket>();
  const startupConnectionRef = useRef(false);
  const { data } = useMe();
  const [corrections, setCorrections] = useState<string | null>();
  const [closeReason, setCloseReason] = useState<string>();
  const [socketStatus, setSocketStatus] = useState<CONNECTION_STATUS>("idle");
  const [joinStatus, setJoinStatus] = useState<JOIN_STATUS>("joining");
  const [state, setState] = useState<Omit<PAYLOAD, "type">>();
  const joinStatusRef = useRef(joinStatus);
  joinStatusRef.current = joinStatus;

  function connectWS() {
    startupConnectionRef.current = true;
    socketRef.current = new WebSocket(`${API_WS}/arena/join/${id}`);
    socketRef.current.onerror = () => {};
    socketRef.current.onopen = () => {
      setSocketStatus("active");
    };
    socketRef.current.onclose = (e) => {
      setJoinStatus("failed_join");
      setSocketStatus("closed");
      setCloseReason(e.reason);
      delete socketRef.current;
    };
    socketRef.current.onmessage = (e) => {
      if (e.data === "pong") return;
      const { type, ...payload }: PAYLOAD = JSON.parse(e.data);
      if (type === "error_occured") {
        return throttledToast("Unexpected error occured");
      } else if (type === "wrong_answer") {
        const { corrections } = payload as unknown as {
          corrections: string | null;
        };
        return setCorrections(corrections);
      } else if (type === "joined_room") {
        setJoinStatus("joined");
      } else if (type === "new_round") {
        setCorrections(undefined);
      } else if (type === "correct_answer") {
        return setCorrections(null);
      }
      setState(payload);
    };
  }

  useEffect(() => {
    if (isReady === false || startupConnectionRef.current === true) return;
    connectWS();
    const interval = setInterval(() => {
      socketRef.current?.send("ping");
    }, HEARTBEAT_INTERVAL);
    return () => {
      socketRef.current?.close(1000, "User exited");
      clearInterval(interval);
    };
  }, [isReady]);

  if (
    joinStatus !== "joined" ||
    state?.gameState.progress == null ||
    state.roomState.finishedAt != null
  )
    return (
      <GameStatusView
        joinStatus={joinStatus}
        closeReason={closeReason}
        gameState={state?.gameState}
        roomState={state?.roomState}
        connectionStatus={socketStatus}
      />
    );

  const {
    currentLevel,
    currentPlayer: player,
    currentLevelStartedAt: levelStartedAt,
  } = state.gameState.progress;

  const forbidAnswering = () => {
    if (data == null) return true;
    return state.gameState.usersProgress[data.username].answers.some(
      (answer) => answer.level === currentLevel
    );
  };

  return (
    <GameView
      key={player.id}
      player={player}
      tipDuration={state.roomState.tipRevealingInterval}
      defaultState={{ startedAt: dayjs(levelStartedAt).format() }}
      leftComponent={
        <MultiplayerLeaderboard
          users_progress={state.gameState.usersProgress}
          active_users={state.activeUsers}
        />
      }
      form={
        <GameForm
          playerID={player.id}
          playerName={player.playerName}
          correctionsProp={corrections}
          disabled={forbidAnswering()}
          correctAnswerText="Correct! Waiting for new round..."
          onAnswer={(answer) => {
            socketRef.current?.send(JSON.stringify({ answer }));
          }}
        />
      }
    />
  );
};
