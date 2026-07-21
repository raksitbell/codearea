import { NextResponse } from "next/server";
import { logout } from "@/server/auth/module";
import { jsonError } from "@/server/http";

export async function POST() {
  try {
    await logout();
    return NextResponse.json({ message: "ออกจากระบบแล้ว" });
  } catch (error) { return jsonError(error); }
}
