import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getConfig } from "@/server/config";
import * as schema from "@/server/db/schema";

let client: ReturnType<typeof postgres> | undefined;
let db: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function getSqlClient() {
  client ??= postgres(getConfig().DATABASE_URL, {
    max: getConfig().DATABASE_POOL_SIZE,
    ssl: "require",
  });
  return client;
}

export function getDb() {
  db ??= drizzle(getSqlClient(), { schema });
  return db;
}

export async function closeDb() {
  await client?.end();
  client = undefined;
  db = undefined;
}
