import { difficultyLevels } from "../utils/constants";

export interface Env {
	__D1_BETA__ARENA_DB: D1Database;
	PLAYERSKV: KVNamespace;
	ARENA_ROOM_DO: DurableObjectNamespace;
	ENVIRONMENT: "development" | "production";
	ORIGIN: string;
	WEB_URL: string;
	DATABASE_HOST: string;
	DATABASE_USERNAME: string;
	DATABASE_PASSWORD: string;
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
