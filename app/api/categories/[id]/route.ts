import { NextResponse } from "next/server";
import { currentUser } from "@/server/auth/request";
import { requireAdmin } from "@/server/auth/module";
import { getCategory, removeCategory, updateCategory } from "@/server/taxonomy/module";
import { jsonError } from "@/server/http";
type C = { params: Promise<{ id: string }> };
export async function GET(_: Request, { params }: C) { try { return NextResponse.json({ data: await getCategory(Number((await params).id)) }); } catch (error) { return jsonError(error); } }
export async function PUT(request: Request, { params }: C) { try { requireAdmin(await currentUser()); return NextResponse.json(await updateCategory(Number((await params).id), await request.json())); } catch (error) { return jsonError(error); } }
export async function DELETE(_: Request, { params }: C) { try { requireAdmin(await currentUser()); await removeCategory(Number((await params).id)); return NextResponse.json({ message: "ลบหมวดหมู่แล้ว" }); } catch (error) { return jsonError(error); } }
