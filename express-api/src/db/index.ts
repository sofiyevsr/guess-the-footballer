import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from "./schema";

const url = process.env.DB_URL as string;

const client = postgres(url);

const db = drizzle(client, { schema });

export default db;
