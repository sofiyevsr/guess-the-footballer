export interface SingleRoom {
  id: string;
  creator_username: string;
  private: 0 | 1;
  size: number;
  current_size: number;
  started_at: number | null;
  finished_at: number | null;
  created_at: number;
}
