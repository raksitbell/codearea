import { NextResponse } from "next/server";
import { register } from "@/server/auth/module";
import { jsonError } from "@/server/http";

export async function POST(request: Request) {
  try {
    const result = await register(await request.json());
    return NextResponse.json({ user: result.user }, { status: 201 });
  } catch (error) { return jsonError(error); }
}
