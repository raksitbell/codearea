import { NextResponse } from "next/server";
import { currentUser } from "@/server/auth/request";
import { requireAdmin } from "@/server/auth/module";
import { createTag, listTags } from "@/server/taxonomy/module";
import { jsonError } from "@/server/http";
export async function GET() { try { return NextResponse.json({ data: await listTags() }); } catch (error) { return jsonError(error); } }
export async function POST(request: Request) { try { requireAdmin(await currentUser()); return NextResponse.json(await createTag(await request.json()), { status: 201 }); } catch (error) { return jsonError(error); } }
