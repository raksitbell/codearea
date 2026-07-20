import { compare, hash } from "bcryptjs";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/server/db/client";
import { sessions, users } from "@/server/db/schema";
import type { AuthUser } from "@/server/auth/module";
import { DomainError } from "@/server/domain/errors";
import { atomicWriteData } from "@/server/problems/file-store";

function response(row: typeof users.$inferSelect) {
  return { id: row.id, display_name: row.displayName, email: row.email, role_id: row.roleId, avatar_url: row.profileImagePath ? `/api/profile-images/${row.id}` : null, bio: row.bio, phone: row.phone, dob: row.dateOfBirth, updated_at: row.updatedAt };
}

export async function listUsers(page: number, limit: number) {
  const [{ count }] = await getDb().select({ count: sql<number>`count(*)::int` }).from(users).where(eq(users.active, true));
  const rows = await getDb().select().from(users).where(eq(users.active, true)).orderBy(desc(users.createdAt)).limit(limit).offset((page - 1) * limit);
  return { data: rows.map(response), pagination: { page, limit, total: count, total_pages: Math.ceil(count / limit) } };
}

export async function getUser(id: number) {
  const [row] = await getDb().select().from(users).where(eq(users.id, id)).limit(1);
  if (!row) throw new DomainError("NOT_FOUND", "ไม่พบผู้ใช้");
  return response(row);
}

export async function updateUser(id: number, raw: unknown, actor: AuthUser) {
  if (actor.id !== id && actor.role !== "admin") throw new DomainError("FORBIDDEN", "แก้ไขได้เฉพาะโปรไฟล์ของตนเอง");
  const data = z.object({ display_name: z.string().trim().min(2).max(80).optional(), avatar_url: z.string().nullable().optional(), bio: z.string().max(1000).optional(), phone: z.string().max(40).optional(), dob: z.string().max(20).nullable().optional(), role_id: z.number().int().positive().optional() }).parse(raw);
  if (data.role_id && actor.role !== "admin") throw new DomainError("FORBIDDEN", "เปลี่ยน role ไม่ได้");
  let imagePath: string | null | undefined;
  if (data.avatar_url === null) imagePath = null;
  else if (data.avatar_url?.startsWith("data:image/")) {
    const match = data.avatar_url.match(/^data:image\/(png|jpeg|webp);base64,(.+)$/);
    if (!match) throw new DomainError("BAD_REQUEST", "รองรับรูป PNG, JPEG หรือ WebP เท่านั้น");
    const bytes = Buffer.from(match[2], "base64");
    if (bytes.length > 2_000_000) throw new DomainError("BAD_REQUEST", "รูปโปรไฟล์ต้องไม่เกิน 2 MB");
    imagePath = `profiles/${id}.${match[1] === "jpeg" ? "jpg" : match[1]}`;
    await atomicWriteData(imagePath, bytes);
  }
  const [row] = await getDb().update(users).set({ displayName: data.display_name, profileImagePath: imagePath, bio: data.bio, phone: data.phone, dateOfBirth: data.dob, roleId: data.role_id, updatedAt: new Date() }).where(eq(users.id, id)).returning();
  if (!row) throw new DomainError("NOT_FOUND", "ไม่พบผู้ใช้");
  return response(row);
}

export async function changePassword(id: number, raw: unknown, actor: AuthUser) {
  if (actor.id !== id) throw new DomainError("FORBIDDEN", "เปลี่ยนได้เฉพาะรหัสผ่านของตนเอง");
  const data = z.object({ old_password: z.string(), new_password: z.string().min(8).max(128) }).parse(raw);
  const [row] = await getDb().select().from(users).where(eq(users.id, id)).limit(1);
  if (!row || !(await compare(data.old_password, row.passwordHash))) throw new DomainError("BAD_REQUEST", "รหัสผ่านเดิมไม่ถูกต้อง");
  await getDb().transaction(async (tx) => {
    await tx.update(users).set({ passwordHash: await hash(data.new_password, 12), updatedAt: new Date() }).where(eq(users.id, id));
    await tx.update(sessions).set({ revokedAt: new Date() }).where(and(eq(sessions.userId, id), isNull(sessions.revokedAt)));
  });
}
