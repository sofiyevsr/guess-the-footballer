import { difficultyLevels } from "../utils/constants";

export interface Env extends Record<string, unknown> {
	ARENA_DB: D1Database;
	PLAYERSKV: KVNamespace;
	ARENA_ROOM_DO: DurableObjectNamespace;
	ENVIRONMENT: "development" | "production";
	ORIGIN: string;
	WEB_URL: string;
	PLAYERS_FILENAME: string;
}

export interface Session {
	username: string;
	created_at: number;
}

export interface CustomEnvironment {
	Bindings: Env;
	Variables: { user?: Session };
}

export interface DatabaseRoom {
	id: string;
	private: number;
	size: number;
	current_size: number;
	creator_username: string;
  difficulty: typeof difficultyLevels[number];
	started_at?: number;
	finished_at?: number;
	created_at: number;
}
