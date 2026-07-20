import { NextResponse } from "next/server";
import { currentUser } from "@/server/auth/request";
import { requireAdmin } from "@/server/auth/module";
import { publishProblem } from "@/server/problems/module";
import { jsonError } from "@/server/http";

export async function POST(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  try { return NextResponse.json(await publishProblem((await params).slug, requireAdmin(await currentUser()))); }
  catch (error) { return jsonError(error); }
}
