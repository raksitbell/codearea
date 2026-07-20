import { NextResponse } from "next/server"; import { currentUser } from "@/server/auth/request"; import { profileSummary } from "@/server/analytics/module"; import { jsonError } from "@/server/http";
export async function GET(){try{return NextResponse.json(await profileSummary((await currentUser()).id));}catch(error){return jsonError(error);}}
