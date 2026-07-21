import { NextResponse } from "next/server";
import { login } from "@/server/auth/module";
import { jsonError } from "@/server/http";

export async function POST(request: Request) {
  try {
    const result = await login(await request.json());
    return NextResponse.json({ user: result.user });
  } catch (error) { return jsonError(error); }
}
