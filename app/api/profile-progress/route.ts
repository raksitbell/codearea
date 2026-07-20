import { NextResponse } from "next/server";
import { currentUser } from "@/server/auth/request";
import { getProgress } from "@/server/progress/module";
import { jsonError } from "@/server/http";
export async function GET() { try { return NextResponse.json(await getProgress((await currentUser()).id)); } catch (error) { return jsonError(error); } }
