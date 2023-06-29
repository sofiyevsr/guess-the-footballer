import {
  varchar,
  pgTable,
  timestamp,
} from "drizzle-orm/pg-core";

export const sessions = pgTable(
  "session",
  {
    username: varchar("username", { length: 24 }).primaryKey(),
    token: varchar("token").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
);
