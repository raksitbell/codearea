import { NextResponse } from "next/server";
import { resetPassword } from "@/server/auth/module";
import { jsonError } from "@/server/http";

export async function POST(request: Request) {
  try { await resetPassword(await request.json()); return NextResponse.json({ message: "เปลี่ยนรหัสผ่านแล้ว" }); }
  catch (error) { return jsonError(error); }
}
