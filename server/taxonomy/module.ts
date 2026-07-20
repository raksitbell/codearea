import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/server/db/client";
import { categories, tags } from "@/server/db/schema";
import { DomainError } from "@/server/domain/errors";

const input = z.object({ name: z.string().trim().min(1).max(80), description: z.string().trim().max(500).optional() });

export async function listCategories() {
  return getDb().select({ id: categories.id, name: categories.name, description: categories.description, status: categories.active }).from(categories).where(eq(categories.active, true)).orderBy(asc(categories.name));
}
export async function getCategory(id: number) {
  const [row] = await getDb().select({ id: categories.id, name: categories.name, description: categories.description, status: categories.active }).from(categories).where(eq(categories.id, id)).limit(1);
  if (!row || !row.status) throw new DomainError("NOT_FOUND", "ไม่พบหมวดหมู่");
  return row;
}
export async function createCategory(value: unknown) {
  const data = input.parse(value);
  const [row] = await getDb().insert(categories).values(data).returning();
  return row;
}
export async function updateCategory(id: number, value: unknown) {
  const data = input.parse(value);
  const [row] = await getDb().update(categories).set(data).where(eq(categories.id, id)).returning();
  if (!row) throw new DomainError("NOT_FOUND", "ไม่พบหมวดหมู่");
  return row;
}
export async function removeCategory(id: number) { await getDb().update(categories).set({ active: false }).where(eq(categories.id, id)); }
export async function listTags() { return getDb().select({ id: tags.id, name: tags.name, status: tags.active }).from(tags).where(eq(tags.active, true)).orderBy(asc(tags.name)); }
export async function createTag(value: unknown) { const data = input.pick({ name: true }).parse(value); return (await getDb().insert(tags).values(data).returning())[0]; }
export async function updateTag(id: number, value: unknown) { const data = input.pick({ name: true }).parse(value); const [row] = await getDb().update(tags).set(data).where(eq(tags.id, id)).returning(); if (!row) throw new DomainError("NOT_FOUND", "ไม่พบ tag"); return row; }
export async function removeTag(id: number) { await getDb().update(tags).set({ active: false }).where(eq(tags.id, id)); }
