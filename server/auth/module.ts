import { compare, hash } from "bcryptjs";
import { and, eq, gt, isNull } from "drizzle-orm";
import { createHash, randomBytes } from "node:crypto";
import { getDb } from "@/server/db/client";
import { passwordResetTokens, roles, sessions, users } from "@/server/db/schema";
import { DomainError } from "@/server/domain/errors";
import { getConfig } from "@/server/config";
import { z } from "zod";

const credentials = z.object({
  email: z.string().email().transform((value) => value.trim().toLowerCase()),
  password: z.string().min(8).max(128),
});

const registration = credentials.extend({
  displayName: z.string().trim().min(2).max(80).optional(),
  display_name: z.string().trim().min(2).max(80).optional(),
}).refine((value) => value.displayName || value.display_name, { message: "กรุณาระบุชื่อที่แสดง" });

function digest(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function newToken() {
  return randomBytes(32).toString("base64url");
}

export type AuthUser = {
  id: number;
  email: string;
  emailVerified: boolean;
  displayName: string;
  role: "learner" | "admin";
  roleId: number;
};

export function publicUser(row: { id: number; email: string; emailVerifiedAt: Date; displayName: string; role: "learner" | "admin"; roleId: number }): AuthUser {
  return Object.assign({
    id: row.id,
    email: row.email,
    emailVerified: true,
    displayName: row.displayName,
    role: row.role,
    roleId: row.roleId,
    display_name: row.displayName,
    email_verified: true,
    role_id: row.roleId,
    avatar_url: null,
  });
}

async function createSession(userId: number) {
  const token = newToken();
  const expiresAt = new Date(Date.now() + getConfig().SESSION_TTL_DAYS * 86_400_000);
  await getDb().insert(sessions).values({ userId, tokenHash: digest(token), expiresAt });
  return { token, expiresAt };
}

export async function register(input: unknown) {
  const data = registration.parse(input);
  const db = getDb();
  const [learnerRole] = await db.select().from(roles).where(eq(roles.name, "learner")).limit(1);
  if (!learnerRole) throw new DomainError("CONFLICT", "ฐานข้อมูลยังไม่ได้ seed roles");
  try {
    const [created] = await db.insert(users).values({
      email: data.email,
      displayName: data.displayName ?? data.display_name!,
      passwordHash: await hash(data.password, 12),
      roleId: learnerRole.id,
      emailVerifiedAt: new Date(),
    }).returning();
    const session = await createSession(created.id);
    return { user: publicUser({ ...created, role: "learner" }), ...session };
  } catch (error) {
    if (String(error).includes("unique")) throw new DomainError("CONFLICT", "อีเมลนี้ถูกใช้งานแล้ว");
    throw error;
  }
}

export async function login(input: unknown) {
  const data = credentials.parse(input);
  const [row] = await getDb().select({
    id: users.id,
    email: users.email,
    displayName: users.displayName,
    passwordHash: users.passwordHash,
    emailVerifiedAt: users.emailVerifiedAt,
    active: users.active,
    role: roles.name,
    roleId: users.roleId,
  }).from(users).innerJoin(roles, eq(users.roleId, roles.id)).where(eq(users.email, data.email)).limit(1);
  if (!row || !row.active || !(await compare(data.password, row.passwordHash))) {
    throw new DomainError("UNAUTHENTICATED", "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
  }
  const session = await createSession(row.id);
  return { user: publicUser(row), ...session };
}

export async function authenticate(token: string | undefined): Promise<AuthUser> {
  if (!token) throw new DomainError("UNAUTHENTICATED", "กรุณาเข้าสู่ระบบ");
  const [row] = await getDb().select({
    id: users.id,
    email: users.email,
    displayName: users.displayName,
    emailVerifiedAt: users.emailVerifiedAt,
    role: roles.name,
    roleId: users.roleId,
  }).from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .innerJoin(roles, eq(users.roleId, roles.id))
    .where(and(eq(sessions.tokenHash, digest(token)), isNull(sessions.revokedAt), gt(sessions.expiresAt, new Date()), eq(users.active, true)))
    .limit(1);
  if (!row) throw new DomainError("UNAUTHENTICATED", "เซสชันหมดอายุหรือถูกยกเลิกแล้ว");
  return publicUser(row);
}

export function requireAdmin(user: AuthUser) {
  if (user.role !== "admin") throw new DomainError("FORBIDDEN", "ต้องใช้สิทธิ์ผู้ดูแลระบบ");
  return user;
}

export async function logout(token: string | undefined) {
  if (token) await getDb().update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.tokenHash, digest(token)));
}

export async function requestPasswordReset(emailValue: unknown) {
  const email = z.string().email().parse(emailValue).trim().toLowerCase();
  const [user] = await getDb().select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (!user) return { token: undefined };
  const token = newToken();
  await getDb().insert(passwordResetTokens).values({
    userId: user.id,
    tokenHash: digest(token),
    expiresAt: new Date(Date.now() + 3_600_000),
  });
  return { token };
}

export async function resetPassword(input: unknown) {
  const data = z.object({ token: z.string().min(20), password: z.string().min(8).max(128) }).parse(input);
  const [reset] = await getDb().select().from(passwordResetTokens).where(and(
    eq(passwordResetTokens.tokenHash, digest(data.token)),
    isNull(passwordResetTokens.usedAt),
    gt(passwordResetTokens.expiresAt, new Date()),
  )).limit(1);
  if (!reset) throw new DomainError("BAD_REQUEST", "โทเค็นรีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุ");
  await getDb().transaction(async (tx) => {
    await tx.update(users).set({ passwordHash: await hash(data.password, 12), updatedAt: new Date() }).where(eq(users.id, reset.userId));
    await tx.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.id, reset.id));
    await tx.update(sessions).set({ revokedAt: new Date() }).where(and(eq(sessions.userId, reset.userId), isNull(sessions.revokedAt)));
  });
}
