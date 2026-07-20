/**
 * App config — ใช้ค่าจาก .env / .env.local
 * NEXT_PUBLIC_* ใช้ได้ทั้ง client และ server
 */
export const config = {
  /** Same-origin Route Handlers are the only browser-facing backend. */
  apiBaseUrl: "/api",

  /** Request timeout (ms) */
  apiTimeout: 30_000,

  /** เปิด debug log ของ API helper */
  apiDebug: process.env.NODE_ENV === "development",
} as const;

export type AppConfig = typeof config;
