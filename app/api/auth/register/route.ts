import { NextResponse } from "next/server";
import { register } from "@/server/auth/module";
import { jsonError } from "@/server/http";
import { sessionCookie } from "@/server/auth/request";

export async function POST(request: Request) {
  try {
    const result = await register(await request.json());
    const response = NextResponse.json({ user: result.user }, { status: 201 });
    response.cookies.set(sessionCookie(result.token, result.expiresAt));
    return response;
  } catch (error) { return jsonError(error); }
}
