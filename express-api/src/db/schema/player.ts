import { relations } from "drizzle-orm";
import { pgTable, serial, json, timestamp, integer } from "drizzle-orm/pg-core";

export const players = pgTable("player", {
  id: serial("id").primaryKey(),
  data: json("data").notNull(),
});

export const dailyChallenge = pgTable("daily_challenge", {
  id: serial("id").primaryKey(),
  playerID: integer("player_id")
    .notNull()
    .references(() => players.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const dailyChallengeRelations = relations(
  dailyChallenge,
  ({ one }) => ({
    player: one(players, {
      fields: [dailyChallenge.playerID],
      references: [players.id],
    }),
  })
);
