import GameForm from "@cmpt/game/form";
import GameStatusView from "@cmpt/game/multiplayer/gameStatusView";
import GameView from "@cmpt/game/view";
import type { CONNECTION_STATUS, JOIN_STATUS, Payload } from "@typ/multiplayer";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { throttledToast } from "utils/common";
import { API_WS } from "utils/constants";
import { useMe } from "utils/hooks/requests/useMe";

export const MultiplayerGameView = () => {
  const {
    query: { id },
    isReady,
  } = useRouter();
  const socketRef = useRef<WebSocket>();
  const startupConnectionRef = useRef(false);
  const { data } = useMe();
  const [corrections, setCorrections] = useState<string | null>();
  const [socketStatus, setSocketStatus] = useState<CONNECTION_STATUS>("idle");
  const [joinStatus, setJoinStatus] = useState<JOIN_STATUS>("joining");
  const [state, setState] = useState<Omit<Payload, "type">>();
  const joinStatusRef = useRef(joinStatus);
  joinStatusRef.current = joinStatus;

  function connectWS() {
    startupConnectionRef.current = true;
    socketRef.current = new WebSocket(`${API_WS}/arena/join/${id}`);
    socketRef.current.onerror = () => {};
    socketRef.current.onopen = () => {
      setSocketStatus("active");
    };
    socketRef.current.onclose = () => {
      if (joinStatusRef.current === "joining") setJoinStatus("failed_join");
      setSocketStatus("closed");
      delete socketRef.current;
    };
    socketRef.current.onmessage = (e) => {
      const { type, ...payload }: Payload = JSON.parse(e.data);
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
    return () => {
      socketRef.current?.close(1000, "User exited");
    };
  }, [isReady]);

  if (
    joinStatus !== "joined" ||
    state?.game_state.progress == null ||
    state.room_state.finished_at != null
  )
    return (
      <GameStatusView
        joinStatus={joinStatus}
        gameState={state?.game_state}
        roomState={state?.room_state}
        connectionStatus={socketStatus}
      />
    );

  const {
    current_level,
    current_player: player,
    current_level_started_at: levelStartedAt,
  } = state.game_state.progress;

  const forbidAnswering = () => {
    if (data == null) return true;
    return state.game_state.users_progress[data.username].answers.some(
      (answer) => answer.level === current_level
    );
  };

  return (
    <GameView
      key={player.id}
      player={player}
      tipDuration={2}
      defaultState={{ startedAt: dayjs(levelStartedAt).format() }}
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
    // TODO leaderboard view
    // TODO room state view
  );
};
