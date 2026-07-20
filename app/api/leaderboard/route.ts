import { NextResponse } from "next/server";
import { currentUser } from "@/server/auth/request";
import { leaderboard } from "@/server/analytics/module";
import { jsonError, parsePositiveInt } from "@/server/http";
export async function GET(request: Request) { try { await currentUser(); const url=new URL(request.url); return NextResponse.json(await leaderboard(parsePositiveInt(url.searchParams.get("page"),1,1_000_000),parsePositiveInt(url.searchParams.get("limit"),20,97))); } catch(error){ return jsonError(error); } }
