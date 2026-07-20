import { NextResponse } from "next/server";
import { currentUser } from "@/server/auth/request";
import { requireAdmin } from "@/server/auth/module";
import { createProblem, listAdminProblems, listProblems } from "@/server/problems/module";
import { jsonError, parsePositiveInt } from "@/server/http";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const adminView = url.searchParams.get("view") === "admin";
    if (adminView) requireAdmin(await currentUser());
    const common = {
      search: url.searchParams.get("search") ?? undefined,
      categoryId: Number(url.searchParams.get("category_id")) || undefined,
      difficulty: Number(url.searchParams.get("difficulty")) || undefined,
      page: parsePositiveInt(url.searchParams.get("page"), 1, 1_000_000),
      limit: parsePositiveInt(url.searchParams.get("limit"), 20, 100),
    };
    const result = adminView ? await listAdminProblems({
      ...common,
      tagIds: (url.searchParams.get("tag") ?? "").split(",").map(Number).filter((value) => Number.isInteger(value) && value > 0),
      status: url.searchParams.get("status") ?? undefined,
    }) : await listProblems(common);
    return NextResponse.json(result);
  } catch (error) { return jsonError(error); }
}

export async function POST(request: Request) {
  try {
    const created = await createProblem(await request.json(), requireAdmin(await currentUser()));
    return NextResponse.json({ ...created, message: "สร้าง Problem draft แล้ว" }, { status: 201 });
  } catch (error) { return jsonError(error); }
}
