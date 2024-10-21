import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { DBPlayer } from "../../types/player";

export const session = sqliteTable("session", {
	username: text("username").primaryKey(),
	token: text("token").notNull(),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
});

export const room = sqliteTable("room", {
	id: text("id").primaryKey(),
	private: integer("private", { mode: "boolean" }).notNull(),
	listID: text("list_id")
		.references(() => gameList.id)
		.notNull(),
	size: integer("size").notNull(),
	levels: integer("levels").notNull(),
	durationBetweenLevels: integer("duration_between_levels").notNull(),
	tipRevealingInterval: integer("tip_revealing_interval").notNull(),
	currentSize: integer("current_size").notNull(),
	creatorUsername: text("creator_username").notNull(),
	startedAt: integer("started_at", { mode: "timestamp" }),
	finishedAt: integer("finished_at", { mode: "timestamp" }),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
});

export const player = sqliteTable("player", {
	id: text("id").primaryKey(),
	data: text("data", { mode: "json" }).$type<DBPlayer>().notNull(),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
});

export const dailyChallenge = sqliteTable("daily_challenge", {
	id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
	playerID: text("player_id")
		.references(() => player.id)
		.notNull(),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
});

export const asset = sqliteTable("asset", {
	key: text("key").primaryKey(),
	ipAddress: text("ip_address").notNull(),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
});

export const gameList = sqliteTable("game_list", {
	id: text("id").primaryKey(),
	official: integer("official", { mode: "boolean" }).notNull(),
	name: text("name").notNull(),
	description: text("description").notNull(),
	imageKey: text("image_key")
		.notNull()
		.references(() => asset.key),
	playerIDs: text("player_ids").notNull(),
	ipAddress: text("ip_address").notNull(),
	approvedAt: integer("approved_at", { mode: "timestamp" }),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
});

export const dailyChallengePlayerRelation = relations(
	dailyChallenge,
	({ one }) => ({
		player: one(player, {
			fields: [dailyChallenge.playerID],
			references: [player.id],
		}),
	})
);

export const roomGameListRelation = relations(room, ({ one }) => ({
	list: one(gameList, {
		fields: [room.listID],
		references: [gameList.id],
	}),
}));
