import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  DATABASE_POOL_SIZE: z.coerce.number().int().positive().max(20).default(5),
  SITE_URL: z.string().url().default("http://localhost:3000"),
  APP_TIMEZONE: z.string().default("Asia/Bangkok"),
  APP_DATA_DIR: z.string().default("./data"),
  PISTON_URL: z.string().url().default("http://localhost:2000"),
  PISTON_LANGUAGES: z.string().default("javascript:18.15.0,python:3.10.0,c++:10.2.0,java:15.0.2"),
  PISTON_RUN_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),
  OLLAMA_URL: z.string().url().default("http://localhost:11434"),
  OLLAMA_CHAT_MODEL: z.string().default("qwen3:4b"),
  OLLAMA_EMBED_MODEL: z.string().default("nomic-embed-text"),
  EMBEDDING_DIMENSIONS: z.coerce.number().int().positive().default(768),
  EMBEDDING_VERSION: z.string().default("nomic-embed-text-v1"),
});

let cached: z.infer<typeof schema> | undefined;
const supabaseSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});
let cachedSupabase: z.infer<typeof supabaseSchema> | undefined;

export function getConfig() {
  cached ??= schema.parse(process.env);
  return cached;
}

export function getSupabaseConfig() {
  cachedSupabase ??= supabaseSchema.parse(process.env);
  return cachedSupabase;
}

export function getAllowedLanguages() {
  return new Map(
    getConfig().PISTON_LANGUAGES.split(",").map((entry) => {
      const [language, version = "*"] = entry.trim().split(":");
      return [language, version] as const;
    }),
  );
}
