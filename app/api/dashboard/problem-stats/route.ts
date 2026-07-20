import { NextResponse } from "next/server";
import { currentUser } from "@/server/auth/request";
import { requireAdmin } from "@/server/auth/module";
import { dashboardProblemStats } from "@/server/analytics/module";
import { jsonError } from "@/server/http";

export async function GET(request: Request) {
  try {
    requireAdmin(await currentUser());
    const url = new URL(request.url);
    return NextResponse.json(await dashboardProblemStats({ search: url.searchParams.get("search") ?? undefined, startDate: url.searchParams.get("startDate") ?? undefined, endDate: url.searchParams.get("endDate") ?? undefined }));
  } catch (error) { return jsonError(error); }
}
