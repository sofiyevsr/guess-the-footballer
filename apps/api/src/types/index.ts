import { DrizzleD1Database } from "drizzle-orm/d1";
import { InferSelectModel } from "drizzle-orm";
import { session } from "../db/schemas";
import * as schema from "../db/schemas";

export interface Env extends Record<string, unknown> {
	R2_STORAGE: R2Bucket;
	ARENA_DB: D1Database;
	ARENA_ROOM_DO: DurableObjectNamespace;
	ENVIRONMENT: "development" | "production";
	STORAGE_URL: string;
	ORIGIN: string;
	WEB_URL: string;
	PLAYERS_FILENAME: string;
	TELEGRAM_CHAT_ID: string;
	TELEGRAM_BOT_TOKEN: string;
	TELEGRAM_SECRET_TOKEN: string;
}

export interface CustomEnvironment {
	Bindings: Env;
	Variables: {
		user?: Omit<InferSelectModel<typeof session>, "token">;
		db: DrizzleD1Database<typeof schema>;
	};
}
