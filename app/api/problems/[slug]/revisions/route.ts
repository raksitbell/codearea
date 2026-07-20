import { NextResponse } from "next/server";
import { currentUser } from "@/server/auth/request";
import { requireAdmin } from "@/server/auth/module";
import { revisionHistory } from "@/server/problems/module";
import { jsonError } from "@/server/http";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  try { requireAdmin(await currentUser()); return NextResponse.json({ data: await revisionHistory((await params).slug) }); }
  catch (error) { return jsonError(error); }
}
