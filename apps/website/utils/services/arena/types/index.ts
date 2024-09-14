export interface SingleRoom {
  id: string;
  private: boolean;
  listID: string;
  size: number;
  levels: number;
  durationBetweenLevels: number;
  tipRevealingInterval: number;
  currentSize: number;
  creatorUsername: string;
  list: {
    name: string;
    imageKey: string;
    official: boolean;
  };
  startedAt: number | null;
  finishedAt: number | null;
  createdAt: number;
}
