import { gameDifficulties } from "utils/services/game/types/game";

export interface SingleRoom {
  id: string;
  creator_username: string;
  private: 0 | 1;
  size: number;
  current_size: number;
  difficulty: typeof gameDifficulties[number];
  started_at: number | null;
  finished_at: number | null;
  created_at: number;
}
