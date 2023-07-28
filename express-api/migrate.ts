import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const url = process.env.DB_URL;
const client = postgres(url, { max: 1 });
const db = drizzle(client);

const main = async () => {
  console.log("Starting");
  await migrate(db, { migrationsFolder: "drizzle" });
  console.log("Success");
  process.exit(0);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
