import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schemas";

export const getDB = (d1: D1Database) => drizzle(d1, { schema });
