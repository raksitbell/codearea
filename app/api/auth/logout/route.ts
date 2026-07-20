import { NextResponse } from "next/server";
import { logout } from "@/server/auth/module";
import { getSessionToken } from "@/server/auth/request";
import { getConfig } from "@/server/config";
import { jsonError } from "@/server/http";

export async function POST() {
  try {
    await logout(await getSessionToken());
    const response = NextResponse.json({ message: "ออกจากระบบแล้ว" });
    response.cookies.set({ name: getConfig().SESSION_COOKIE_NAME, value: "", expires: new Date(0), path: "/" });
    return response;
  } catch (error) { return jsonError(error); }
}
