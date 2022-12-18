import { SinglePlayerData } from "utils/services/game/types/game";

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
  room_state: {
    id: string;
    private: number;
    size: number;
    current_size: number;
    creator_username: string;
    started_at?: number;
    finished_at?: number;
    created_at: number;
  };
  game_state: {
    users: string[];
    progress: {
      current_level: number;
      current_player: SinglePlayerData;
      current_level_started_at: number;
    } | null;
    users_progress: {
      [K in string]: {
        points: number;
        answers: { level: number; timestamp: number }[];
      };
    };
  };
  active_users: string[];
};
