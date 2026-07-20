import { NextResponse } from "next/server";
import { currentUser } from "@/server/auth/request";
import { requireAdmin } from "@/server/auth/module";
import { archiveProblem, getDraftProblem, getProblem, setProblemPublished, updateDraft } from "@/server/problems/module";
import { jsonError } from "@/server/http";

type Context = { params: Promise<{ slug: string }> };

export async function GET(_: Request, context: Context) {
  try {
    const { slug } = await context.params;
    let staff = false;
    try { staff = (await currentUser()).role === "admin"; } catch {}
    return NextResponse.json(staff ? await getDraftProblem(slug) : await getProblem(slug));
  } catch (error) { return jsonError(error); }
}

export async function PUT(request: Request, context: Context) {
  try {
    const { slug } = await context.params;
    const body = await request.json();
    const actor = requireAdmin(await currentUser());
    if (typeof body?.status === "boolean" && Object.keys(body).length === 1) {
      return NextResponse.json(await setProblemPublished(slug, body.status));
    }
    return NextResponse.json(await updateDraft(slug, body, actor));
  } catch (error) { return jsonError(error); }
}

export async function DELETE(_: Request, context: Context) {
  try {
    requireAdmin(await currentUser());
    return NextResponse.json(await archiveProblem((await context.params).slug));
  } catch (error) { return jsonError(error); }
}
