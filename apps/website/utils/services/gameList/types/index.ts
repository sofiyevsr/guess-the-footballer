export interface GameListInput {
  name: string;
  description: string;
  imageKey: string;
  playerIds: string[];
}

export interface GameListResponse {
  gameLists: {
    id: string;
    name: string;
    description: string | null;
    imageKey: string | null;
    official: boolean;
    approvedAt: Date | null;
    createdAt: Date;
  }[];
  cursor?: number;
}

export interface SearchGameListResponse {
  gameLists: {
    id: string;
    name: string;
    imageKey: string | null;
    official: boolean;
    approvedAt: Date | null;
    createdAt: Date;
  }[];
}

export interface SearchPlayerResponse {
  players: {
    id: string;
    playerName: string;
    firstName: string;
    lastName: string;
    alias: string;
    nationImage: string;
    club: string;
    playerImage: string;
  }[];
}
