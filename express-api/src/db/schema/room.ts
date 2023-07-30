import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { difficultyLevels } from "utils/constants";

export const difficultyEnum = pgEnum("difficulty", difficultyLevels);

export const rooms = pgTable("room", {
  id: varchar("id", { length: 21 }).primaryKey(),
  private: boolean("private").notNull(),
  difficulty: difficultyEnum("difficulty").notNull(),
  size: integer("size").notNull(),
  current_size: integer("current_size").notNull(),
  started_at: timestamp("started_at"),
  finished_at: timestamp("finished_at"),
  creator_username: varchar("creator_username").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
});
