import { NextResponse } from "next/server";
import { requestPasswordReset } from "@/server/auth/module";
import { jsonError } from "@/server/http";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const result = await requestPasswordReset(email);
    return NextResponse.json({
      message: "หากอีเมลนี้มีอยู่ ระบบได้สร้างคำขอรีเซ็ตรหัสผ่านแล้ว",
      ...(process.env.NODE_ENV !== "production" && result.token ? { resetToken: result.token } : {}),
    });
  } catch (error) { return jsonError(error); }
}
