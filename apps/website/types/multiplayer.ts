import { SinglePlayerData } from "utils/services/game/types";

export type JOIN_STATUS = "joining" | "joined" | "failed_join";
export type CONNECTION_STATUS = "idle" | "active" | "closed";

export const PAYLOADTYPES = [
  "game_started",
  "game_finished",
  "wrong_answer",
  "correct_answer",
  "new_correct_answer",
  "new_round",
  "user_dropped",
  "user_joined",
  "joined_room",
  "error_occured",
] as const;

export type PAYLOADTYPE = (typeof PAYLOADTYPES)[number];

export type PAYLOAD = {
  type: PAYLOADTYPE;
  roomState: {
    id: string;
    private: number;
    size: number;
    levels: number;
    durationBetweenLevels: number;
    tipRevealingInterval: number;
    currentSize: number;
    creatorUsername: string;
    startedAt?: number;
    finishedAt?: number;
    createdAt: number;
  };
  gameState: {
    users: string[];
    progress: {
      currentLevel: number;
      currentPlayer: SinglePlayerData;
      currentLevelStartedAt: number;
    } | null;
    usersProgress: {
      [K in string]: {
        points: number;
        answers: { level: number; timestamp: number }[];
      };
    };
  };
  activeUsers: string[];
};
