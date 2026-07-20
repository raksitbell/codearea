import { NextResponse } from "next/server";
import { currentUser } from "@/server/auth/request";
import { requireAdmin } from "@/server/auth/module";
import { removeTag, updateTag } from "@/server/taxonomy/module";
import { jsonError } from "@/server/http";
type C = { params: Promise<{ id: string }> };
export async function PUT(request: Request, { params }: C) { try { requireAdmin(await currentUser()); return NextResponse.json(await updateTag(Number((await params).id), await request.json())); } catch (error) { return jsonError(error); } }
export async function DELETE(_: Request, { params }: C) { try { requireAdmin(await currentUser()); await removeTag(Number((await params).id)); return NextResponse.json({ message: "ลบ tag แล้ว" }); } catch (error) { return jsonError(error); } }
