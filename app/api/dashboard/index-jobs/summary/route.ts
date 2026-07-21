import { NextResponse } from "next/server";
import { currentUser } from "@/server/auth/request";
import { requireAdmin } from "@/server/auth/module";
import { indexJobsSummary } from "@/server/analytics/module";
import { jsonError } from "@/server/http";

export async function GET() {
  try {
    requireAdmin(await currentUser());
    return NextResponse.json(await indexJobsSummary());
  } catch (error) { return jsonError(error); }
}
