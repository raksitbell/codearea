import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } },
  test: {
    environment: "node",
    env: {
      DATABASE_URL: "postgres://codearea:codearea@localhost:5432/codearea_test",
      APP_TIMEZONE: "Asia/Bangkok",
    },
  },
});
