import { NextResponse } from "next/server";
import { currentUser } from "@/server/auth/request";
import { runPublicTests } from "@/server/submissions/module";
import { jsonError } from "@/server/http";
export async function POST(request: Request) { try { await currentUser(); return NextResponse.json(await runPublicTests(await request.json())); } catch (error) { return jsonError(error); } }
