import { NextResponse } from "next/server";
import { currentUser } from "@/server/auth/request";
import { listSubmissions, submit } from "@/server/submissions/module";
import { jsonError, parsePositiveInt } from "@/server/http";
export async function GET(request: Request) { try { const user = await currentUser(); const url = new URL(request.url); return NextResponse.json(await listSubmissions(user.id, { slug: url.searchParams.get("problem_slug") ?? undefined, page: parsePositiveInt(url.searchParams.get("page"), 1, 1_000_000), limit: parsePositiveInt(url.searchParams.get("limit"), 20, 100) })); } catch (error) { return jsonError(error); } }
export async function POST(request: Request) { try { const user = await currentUser(); return NextResponse.json(await submit(await request.json(), user.id), { status: 201 }); } catch (error) { return jsonError(error); } }
