import type { SupabaseClient, User } from "@supabase/supabase-js";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/server/db/client";
import { roles, users } from "@/server/db/schema";
import { DomainError } from "@/server/domain/errors";
import { getConfig } from "@/server/config";
import { createSupabaseServerClient } from "@/server/auth/supabase";

const credentials = z.object({
  email: z.string().email().transform((value) => value.trim().toLowerCase()),
  password: z.string().min(8).max(128),
});

const registration = credentials.extend({
  displayName: z.string().trim().min(2).max(80).optional(),
  display_name: z.string().trim().min(2).max(80).optional(),
}).refine((value) => value.displayName || value.display_name, { message: "กรุณาระบุชื่อที่แสดง" });

export type AuthUser = {
  id: number;
  authUserId: string;
  email: string;
  emailVerified: boolean;
  displayName: string;
  role: "learner" | "admin";
  roleId: number;
};

type PublicUserRow = {
  id: number;
  authUserId: string;
  email: string;
  emailVerifiedAt: Date;
  displayName: string;
  role: "learner" | "admin";
  roleId: number;
};

export function publicUser(row: PublicUserRow): AuthUser {
  return Object.assign({
    id: row.id,
    authUserId: row.authUserId,
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

function authError(message: string | undefined) {
  const normalized = message?.toLowerCase() ?? "";
  if (normalized.includes("already registered") || normalized.includes("already exists")) {
    return new DomainError("CONFLICT", "อีเมลนี้ถูกใช้งานแล้ว");
  }
  if (normalized.includes("invalid login credentials")) {
    return new DomainError("UNAUTHENTICATED", "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
  }
  return new DomainError("BAD_REQUEST", message || "Supabase Auth ไม่สามารถดำเนินการได้");
}

async function ensureProfile(authUser: User, displayName?: string) {
  if (!authUser.email) throw new DomainError("BAD_REQUEST", "Supabase Auth ไม่ได้ส่งอีเมลผู้ใช้กลับมา");
  const db = getDb();
  const [learnerRole] = await db.select().from(roles).where(eq(roles.name, "learner")).limit(1);
  if (!learnerRole) throw new DomainError("CONFLICT", "ฐานข้อมูลยังไม่ได้ seed roles");

  const name = displayName?.trim()
    || (typeof authUser.user_metadata.display_name === "string" ? authUser.user_metadata.display_name.trim() : "")
    || authUser.email.split("@")[0];

  await db.insert(users).values({
    authUserId: authUser.id,
    email: authUser.email.toLowerCase(),
    displayName: name,
    roleId: learnerRole.id,
    emailVerifiedAt: new Date(authUser.email_confirmed_at ?? Date.now()),
  }).onConflictDoUpdate({
    target: users.authUserId,
    set: {
      email: authUser.email.toLowerCase(),
      emailVerifiedAt: new Date(authUser.email_confirmed_at ?? Date.now()),
      updatedAt: new Date(),
    },
  });

  const [row] = await db.select({
    id: users.id,
    authUserId: users.authUserId,
    email: users.email,
    emailVerifiedAt: users.emailVerifiedAt,
    displayName: users.displayName,
    active: users.active,
    role: roles.name,
    roleId: users.roleId,
  }).from(users).innerJoin(roles, eq(users.roleId, roles.id)).where(eq(users.authUserId, authUser.id)).limit(1);

  if (!row || !row.active) throw new DomainError("UNAUTHENTICATED", "บัญชีนี้ถูกระงับการใช้งาน");
  return publicUser(row);
}

export async function register(input: unknown, supabase?: SupabaseClient) {
  const data = registration.parse(input);
  const displayName = data.displayName ?? data.display_name!;
  const client = supabase ?? await createSupabaseServerClient();
  const { data: auth, error } = await client.auth.signUp({
    email: data.email,
    password: data.password,
    options: { data: { display_name: displayName } },
  });
  if (error) throw authError(error.message);
  if (!auth.user) throw new DomainError("BAD_REQUEST", "Supabase Auth ไม่ได้สร้างผู้ใช้");
  if (!auth.session) {
    throw new DomainError("CONFLICT", "โปรดปิด Confirm email ใน Supabase เพื่อให้สมัครแล้วเข้าใช้งานได้ทันที");
  }
  return { user: await ensureProfile(auth.user, displayName) };
}

export async function login(input: unknown, supabase?: SupabaseClient) {
  const data = credentials.parse(input);
  const client = supabase ?? await createSupabaseServerClient();
  const { data: auth, error } = await client.auth.signInWithPassword(data);
  if (error) throw authError(error.message);
  if (!auth.user) throw new DomainError("UNAUTHENTICATED", "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
  return { user: await ensureProfile(auth.user) };
}

export async function authenticate(supabase?: SupabaseClient): Promise<AuthUser> {
  const client = supabase ?? await createSupabaseServerClient();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) throw new DomainError("UNAUTHENTICATED", "กรุณาเข้าสู่ระบบ");
  return ensureProfile(data.user);
}

export function requireAdmin(user: AuthUser) {
  if (user.role !== "admin") throw new DomainError("FORBIDDEN", "ต้องใช้สิทธิ์ผู้ดูแลระบบ");
  return user;
}

export async function logout(supabase?: SupabaseClient) {
  const client = supabase ?? await createSupabaseServerClient();
  const { error } = await client.auth.signOut();
  if (error) throw authError(error.message);
}

export async function requestPasswordReset(emailValue: unknown, supabase?: SupabaseClient) {
  const email = z.string().email().parse(emailValue).trim().toLowerCase();
  const client = supabase ?? await createSupabaseServerClient();
  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: `${getConfig().SITE_URL}/api/auth/callback?next=/reset-password`,
  });
  if (error) throw authError(error.message);
}

export async function resetPassword(input: unknown, supabase?: SupabaseClient) {
  const data = z.object({ password: z.string().min(8).max(128) }).parse(input);
  const client = supabase ?? await createSupabaseServerClient();
  const { error } = await client.auth.updateUser({ password: data.password });
  if (error) throw authError(error.message);
}

export async function changeOwnPassword(input: unknown, actor: AuthUser, supabase?: SupabaseClient) {
  const data = z.object({ old_password: z.string().min(1), new_password: z.string().min(8).max(128) }).parse(input);
  const client = supabase ?? await createSupabaseServerClient();
  const { error } = await client.auth.updateUser({
    password: data.new_password,
    current_password: data.old_password,
  });
  if (error) throw authError(error.message);
  await getDb().update(users).set({ updatedAt: new Date() }).where(and(eq(users.id, actor.id), eq(users.authUserId, actor.authUserId)));
}
