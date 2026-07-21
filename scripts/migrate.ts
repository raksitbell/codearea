import "@/scripts/load-env";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { closeDb, getDb } from "@/server/db/client";

async function main() {
  await migrate(getDb(), { migrationsFolder: "./drizzle" });
  await closeDb();
}

main().catch(async (error) => {
  console.error(error);
  await closeDb();
  process.exitCode = 1;
});
