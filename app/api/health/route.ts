import { NextResponse } from "next/server";
import { getSqlClient } from "@/server/db/client";

export async function GET() {
  try { await getSqlClient()`select 1`; return NextResponse.json({ status: "ok" }); }
  catch { return NextResponse.json({ status: "unavailable" }, { status: 503 }); }
}
