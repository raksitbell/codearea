import { NextResponse } from "next/server";
import { currentUser } from "@/server/auth/request";
import { requireAdmin } from "@/server/auth/module";
import { dashboardSummary } from "@/server/analytics/module";
import { jsonError } from "@/server/http";
export async function GET(){ try { requireAdmin(await currentUser()); return NextResponse.json(await dashboardSummary()); } catch(error){ return jsonError(error); } }
