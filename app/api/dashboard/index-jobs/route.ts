import { NextResponse } from "next/server";
import { currentUser } from "@/server/auth/request";
import { requireAdmin } from "@/server/auth/module";
import { indexJobsList } from "@/server/analytics/module";
import { jsonError, parsePositiveInt } from "@/server/http";

export async function GET(request: Request) {
  try {
    requireAdmin(await currentUser());
    const url = new URL(request.url);
    return NextResponse.json(await indexJobsList({
      state: url.searchParams.get("state") ?? undefined,
      page: parsePositiveInt(url.searchParams.get("page"), 1, 1_000_000),
      limit: parsePositiveInt(url.searchParams.get("limit"), 20, 100),
    }));
  } catch (error) { return jsonError(error); }
}
