import { NextResponse } from "next/server";
import { requestPasswordReset } from "@/server/auth/module";
import { jsonError } from "@/server/http";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    await requestPasswordReset(email);
    return NextResponse.json({
      message: "หากอีเมลนี้มีอยู่ ระบบได้ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว",
    });
  } catch (error) { return jsonError(error); }
}
