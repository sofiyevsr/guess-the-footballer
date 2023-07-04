import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { difficultyLevels } from "utils/constants";

const difficultyEnum = pgEnum("difficulty", difficultyLevels);

export const rooms = pgTable("room", {
  id: serial("id").primaryKey(),
  private: boolean("private").notNull(),
  difficulty: difficultyEnum("difficulty").notNull(),
  size: integer("size").notNull(),
  currentSize: integer("current_size").notNull(),
  startedAt: timestamp("started_at"),
  finishedAt: timestamp("finished_at"),
  creatorUsername: varchar("creator_username"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
