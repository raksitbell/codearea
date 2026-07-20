import { NextResponse } from "next/server";
import { achievementCatalog } from "@/server/progress/module";
import { jsonError } from "@/server/http";
export async function GET() { try { return NextResponse.json({ data: await achievementCatalog() }); } catch (error) { return jsonError(error); } }
