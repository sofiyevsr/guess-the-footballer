import { relations } from "drizzle-orm";
import { pgTable, serial, json, timestamp, integer } from "drizzle-orm/pg-core";

export const players = pgTable("player", {
  id: integer("id").primaryKey(),
  value: json("value").notNull(),
});

export const dailyChallenge = pgTable("daily_challenge", {
  id: serial("id").primaryKey(),
  player_id: integer("player_id")
    .notNull()
    .references(() => players.id),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const dailyChallengeRelations = relations(
  dailyChallenge,
  ({ one }) => ({
    player: one(players, {
      fields: [dailyChallenge.player_id],
      references: [players.id],
    }),
  })
);
