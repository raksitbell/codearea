import { cookies } from "next/headers";
import { authenticate } from "@/server/auth/module";
import { getConfig } from "@/server/config";

export async function getSessionToken() {
  return (await cookies()).get(getConfig().SESSION_COOKIE_NAME)?.value;
}

export async function currentUser() {
  return authenticate(await getSessionToken());
}

export function sessionCookie(token: string, expires: Date) {
  return {
    name: getConfig().SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires,
  };
}
