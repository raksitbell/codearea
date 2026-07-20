import { NextResponse } from "next/server";
import { currentUser } from "@/server/auth/request";
import { jsonError } from "@/server/http";

export async function GET() {
  try { return NextResponse.json({ user: await currentUser() }); }
  catch (error) { return jsonError(error); }
}
