import { NextResponse } from "next/server";
import { currentUser } from "@/server/auth/request";
import { requireAdmin } from "@/server/auth/module";
import { userActivityReport } from "@/server/analytics/module";
import { jsonError, parsePositiveInt } from "@/server/http";

export async function GET(request: Request) {
  try {
    requireAdmin(await currentUser());
    const url = new URL(request.url);
    return NextResponse.json(await userActivityReport({
      page: parsePositiveInt(url.searchParams.get("page"), 1, 1_000_000),
      limit: parsePositiveInt(url.searchParams.get("limit"), 20, 100),
      search: url.searchParams.get("search") ?? undefined,
      startDate: url.searchParams.get("start_date") ?? undefined,
      endDate: url.searchParams.get("end_date") ?? undefined,
    }));
  } catch (error) {
    return jsonError(error);
  }
}
