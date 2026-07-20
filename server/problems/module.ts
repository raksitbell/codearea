import matter from "gray-matter";
import { randomUUID } from "node:crypto";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/server/db/client";
import {
  aiIndexJobs,
  categories,
  draftTags,
  problemDrafts,
  problemRevisions,
  problems,
  revisionTags,
  tags,
  testCases,
} from "@/server/db/schema";
import { DomainError } from "@/server/domain/errors";
import type { AuthUser } from "@/server/auth/module";
import { getConfig } from "@/server/config";
import { atomicWrite, checksum, readMarkdown, removeMarkdown } from "@/server/problems/file-store";

const testCaseInput = z.object({
  input: z.string().optional(),
  input_data: z.string().optional(),
  expectedOutput: z.string().optional(),
  output_data: z.string().optional(),
  public: z.boolean().optional(),
  is_simple: z.boolean().optional(),
  active: z.boolean().optional(),
  status: z.boolean().optional(),
  order: z.coerce.number().int().positive().optional(),
  case_order: z.coerce.number().int().positive().optional(),
});

const draftInput = z.object({
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  code: z.string().trim().min(2).max(100).optional(),
  title: z.string().trim().min(2).max(200),
  categoryId: z.coerce.number().int().positive().nullable().optional(),
  category_id: z.coerce.number().int().positive().nullable().optional(),
  difficulty: z.coerce.number().int().min(1).max(3).default(1),
  statement: z.string().optional(),
  description: z.string().default(""),
  constraints: z.string().default(""),
  objectives: z.array(z.string()).default([]),
  hints: z.array(z.string()).default([]),
  expectedComplexity: z.string().nullable().optional(),
  expected_complexity: z.string().nullable().optional(),
  timeLimitMs: z.coerce.number().int().positive().max(60_000).optional(),
  time_limit: z.coerce.number().int().positive().max(60_000).optional(),
  memoryLimitKb: z.coerce.number().int().positive().max(4_194_304).optional(),
  memory_limit: z.coerce.number().int().positive().max(4_194_304).optional(),
  points: z.coerce.number().int().nonnegative().max(100_000).default(100),
  canonicalSolution: z.string().nullable().optional(),
  solution: z.string().nullable().optional(),
  staffNotes: z.string().nullable().optional(),
  tagNames: z.array(z.string()).optional(),
  tag: z.array(z.string()).optional(),
  testCases: z.array(testCaseInput).optional(),
  test_cases: z.array(testCaseInput).optional(),
});

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function normalizeProblemDraft(input: unknown) {
  const value = draftInput.parse(input);
  const slug = value.slug ?? slugify(value.code ?? value.title);
  if (!slug) throw new DomainError("BAD_REQUEST", "ไม่สามารถสร้าง slug จากชื่อ Problem ได้");
  const statement = value.statement ?? [value.description, value.constraints && `## Constraints\n\n${value.constraints}`].filter(Boolean).join("\n\n");
  return {
    slug,
    title: value.title,
    categoryId: value.categoryId ?? value.category_id ?? null,
    difficulty: value.difficulty,
    statement,
    description: value.description,
    constraints: value.constraints,
    objectives: value.objectives,
    hints: value.hints,
    expectedComplexity: value.expectedComplexity ?? value.expected_complexity ?? null,
    timeLimitMs: value.timeLimitMs ?? value.time_limit ?? 1000,
    memoryLimitKb: value.memoryLimitKb ?? value.memory_limit ?? 65536,
    points: value.points,
    canonicalSolution: value.canonicalSolution ?? value.solution ?? null,
    staffNotes: value.staffNotes ?? null,
    tagNames: (value.tagNames ?? value.tag ?? []).map((tag) => tag.trim()).filter(Boolean),
    testCases: (value.testCases ?? value.test_cases ?? []).map((item, index) => ({
      input: item.input ?? item.input_data ?? "",
      expectedOutput: item.expectedOutput ?? item.output_data ?? "",
      public: item.public ?? item.is_simple ?? false,
      active: item.active ?? item.status ?? true,
      order: item.order ?? item.case_order ?? index + 1,
    })),
  };
}

export function buildLearnerMarkdown(value: ReturnType<typeof normalizeProblemDraft>) {
  return matter.stringify(value.statement.trim(), {
    title: value.title,
    slug: value.slug,
    difficulty: value.difficulty,
    categoryId: value.categoryId,
    tags: value.tagNames,
    expectedComplexity: value.expectedComplexity,
    timeLimitMs: value.timeLimitMs,
    memoryLimitKb: value.memoryLimitKb,
    points: value.points,
    objectives: value.objectives,
    hints: value.hints,
    publicExamples: value.testCases.filter((test) => test.public).map((test) => ({ input: test.input, output: test.expectedOutput })),
  });
}

async function replaceTags(tx: Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0], problemId: string, names: string[]) {
  await tx.delete(draftTags).where(eq(draftTags.problemId, problemId));
  if (!names.length) return [];
  const tagRows = await tx.insert(tags).values(names.map((name) => ({ name }))).onConflictDoUpdate({ target: tags.name, set: { active: true } }).returning();
  await tx.insert(draftTags).values(tagRows.map((tag) => ({ problemId, tagId: tag.id }))).onConflictDoNothing();
  return tagRows;
}

async function replaceDraftTests(tx: Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0], problemId: string, rows: ReturnType<typeof normalizeProblemDraft>["testCases"]) {
  await tx.delete(testCases).where(eq(testCases.problemId, problemId));
  if (rows.length) await tx.insert(testCases).values(rows.map((row) => ({ problemId, caseOrder: row.order, input: row.input, expectedOutput: row.expectedOutput, public: row.public, active: row.active })));
}

export async function createProblem(input: unknown, actor: AuthUser) {
  const value = normalizeProblemDraft(input);
  const markdown = buildLearnerMarkdown(value);
  const db = getDb();
  const [problem] = await db.insert(problems).values({ slug: value.slug, createdBy: actor.id }).returning();
  const draftPath = `problems/${problem.id}/draft.md`;
  try {
    await atomicWrite(draftPath, markdown);
    await db.transaction(async (tx) => {
      await tx.insert(problemDrafts).values({ problemId: problem.id, title: value.title, categoryId: value.categoryId, difficulty: value.difficulty, markdownPath: draftPath, checksum: checksum(markdown), expectedComplexity: value.expectedComplexity, timeLimitMs: value.timeLimitMs, memoryLimitKb: value.memoryLimitKb, points: value.points, canonicalSolution: value.canonicalSolution, staffNotes: value.staffNotes, updatedBy: actor.id });
      await replaceTags(tx, problem.id, value.tagNames);
      await replaceDraftTests(tx, problem.id, value.testCases);
    });
    return { id: problem.id, slug: problem.slug, code: problem.slug };
  } catch (error) {
    await removeMarkdown(draftPath);
    await db.delete(problems).where(eq(problems.id, problem.id));
    throw error;
  }
}

export async function updateDraft(slug: string, input: unknown, actor: AuthUser) {
  const value = normalizeProblemDraft({ ...(input as object), slug });
  const db = getDb();
  const [row] = await db.select({ id: problems.id, path: problemDrafts.markdownPath }).from(problems).innerJoin(problemDrafts, eq(problems.id, problemDrafts.problemId)).where(eq(problems.slug, slug)).limit(1);
  if (!row) throw new DomainError("NOT_FOUND", "ไม่พบ Problem");
  const previous = await readMarkdown(row.path).catch(() => undefined);
  const markdown = buildLearnerMarkdown(value);
  await atomicWrite(row.path, markdown);
  try {
    await db.transaction(async (tx) => {
      await tx.update(problemDrafts).set({ title: value.title, categoryId: value.categoryId, difficulty: value.difficulty, checksum: checksum(markdown), expectedComplexity: value.expectedComplexity, timeLimitMs: value.timeLimitMs, memoryLimitKb: value.memoryLimitKb, points: value.points, canonicalSolution: value.canonicalSolution, staffNotes: value.staffNotes, updatedBy: actor.id, updatedAt: new Date() }).where(eq(problemDrafts.problemId, row.id));
      await tx.update(problems).set({ updatedAt: new Date() }).where(eq(problems.id, row.id));
      await replaceTags(tx, row.id, value.tagNames);
      await replaceDraftTests(tx, row.id, value.testCases);
    });
  } catch (error) {
    if (previous === undefined) await removeMarkdown(row.path); else await atomicWrite(row.path, previous);
    throw error;
  }
  return { slug };
}

export async function publishProblem(slug: string, actor: AuthUser) {
  const db = getDb();
  let revisionPath: string | undefined;
  try {
    const result = await db.transaction(async (tx) => {
      const [identity] = await tx.select({ id: problems.id }).from(problems).where(eq(problems.slug, slug)).limit(1);
      if (!identity) throw new DomainError("NOT_FOUND", "ไม่พบ Problem draft");
      await tx.execute(sql`select id from problems where id = ${identity.id} for update`);
      const [base] = await tx.select({ problem: problems, draft: problemDrafts }).from(problems).innerJoin(problemDrafts, eq(problems.id, problemDrafts.problemId)).where(eq(problems.id, identity.id)).limit(1);
      if (!base) throw new DomainError("NOT_FOUND", "ไม่พบ Problem draft");
      const markdown = await readMarkdown(base.draft.markdownPath);
      if (checksum(markdown) !== base.draft.checksum) throw new DomainError("CONFLICT", "checksum ของ draft ไม่ตรงกับฐานข้อมูล");
      const nextRevision = (base.problem.publishedRevision ?? 0) + 1;
      revisionPath = `problems/${base.problem.id}/revisions/${nextRevision}-${randomUUID()}.md`;
      await atomicWrite(revisionPath, markdown);
      const [revision] = await tx.insert(problemRevisions).values({ problemId: base.problem.id, revision: nextRevision, title: base.draft.title, categoryId: base.draft.categoryId, difficulty: base.draft.difficulty, markdownPath: revisionPath, checksum: base.draft.checksum, expectedComplexity: base.draft.expectedComplexity, timeLimitMs: base.draft.timeLimitMs, memoryLimitKb: base.draft.memoryLimitKb, points: base.draft.points, canonicalSolution: base.draft.canonicalSolution, staffNotes: base.draft.staffNotes, publishedBy: actor.id }).returning();
      const tagRows = await tx.select().from(draftTags).where(eq(draftTags.problemId, base.problem.id));
      if (tagRows.length) await tx.insert(revisionTags).values(tagRows.map((tag) => ({ revisionId: revision.id, tagId: tag.tagId })));
      const tests = await tx.select().from(testCases).where(eq(testCases.problemId, base.problem.id));
      if (tests.length) await tx.insert(testCases).values(tests.map((test) => ({ revisionId: revision.id, caseOrder: test.caseOrder, input: test.input, expectedOutput: test.expectedOutput, public: test.public, active: test.active })));
      await tx.update(problems).set({ state: "published", publishedRevision: nextRevision, updatedAt: new Date() }).where(eq(problems.id, base.problem.id));
      await tx.insert(aiIndexJobs).values({ problemId: base.problem.id, revisionId: revision.id, checksum: base.draft.checksum, embeddingVersion: getConfig().EMBEDDING_VERSION }).onConflictDoNothing();
      return revision;
    });
    return { slug, revision: result.revision, checksum: result.checksum };
  } catch (error) {
    if (revisionPath) await removeMarkdown(revisionPath);
    throw error;
  }
}

async function getTagNames(revisionId: string) {
  return (await getDb().select({ name: tags.name }).from(revisionTags).innerJoin(tags, eq(revisionTags.tagId, tags.id)).where(eq(revisionTags.revisionId, revisionId))).map((tag) => tag.name);
}

export async function getProblem(slug: string, includeStaff = false) {
  const [row] = await getDb().select({ problem: problems, revision: problemRevisions, categoryName: categories.name }).from(problems)
    .innerJoin(problemRevisions, and(eq(problemRevisions.problemId, problems.id), eq(problemRevisions.revision, problems.publishedRevision)))
    .leftJoin(categories, eq(problemRevisions.categoryId, categories.id))
    .where(and(eq(problems.slug, slug), eq(problems.state, "published"))).limit(1);
  if (!row) throw new DomainError("NOT_FOUND", "ไม่พบ Problem ที่เผยแพร่แล้ว");
  const markdown = await readMarkdown(row.revision.markdownPath);
  if (checksum(markdown) !== row.revision.checksum) throw new DomainError("CONFLICT", "ไฟล์ revision ไม่ตรงกับ checksum");
  const parsed = matter(markdown);
  const tests = await getDb().select().from(testCases).where(and(eq(testCases.revisionId, row.revision.id), ...(includeStaff ? [] : [eq(testCases.public, true)]))).orderBy(asc(testCases.caseOrder));
  return {
    id: row.problem.id,
    code: row.problem.slug,
    slug: row.problem.slug,
    title: row.revision.title,
    category_id: row.revision.categoryId,
    category_name: row.categoryName,
    difficulty: row.revision.difficulty,
    description: parsed.content,
    markdown: parsed.content,
    constraints: "",
    expected_complexity: row.revision.expectedComplexity,
    time_limit: row.revision.timeLimitMs,
    memory_limit: row.revision.memoryLimitKb,
    points: row.revision.points,
    tags: await getTagNames(row.revision.id),
    test_cases: tests.map((test) => ({ id: test.id, input_data: test.input, output_data: test.expectedOutput, case_order: test.caseOrder, is_simple: test.public, status: test.active })),
    revision: row.revision.revision,
    ...(includeStaff ? { solution: row.revision.canonicalSolution, staff_notes: row.revision.staffNotes } : {}),
  };
}

export async function getDraftProblem(slug: string) {
  const [row] = await getDb().select({ problem: problems, draft: problemDrafts, categoryName: categories.name }).from(problems)
    .innerJoin(problemDrafts, eq(problemDrafts.problemId, problems.id))
    .leftJoin(categories, eq(problemDrafts.categoryId, categories.id))
    .where(eq(problems.slug, slug)).limit(1);
  if (!row) throw new DomainError("NOT_FOUND", "ไม่พบ Problem draft");
  const markdown = await readMarkdown(row.draft.markdownPath);
  const parsed = matter(markdown);
  const tagRows = await getDb().select({ name: tags.name }).from(draftTags).innerJoin(tags, eq(draftTags.tagId, tags.id)).where(eq(draftTags.problemId, row.problem.id));
  const tests = await getDb().select().from(testCases).where(eq(testCases.problemId, row.problem.id)).orderBy(asc(testCases.caseOrder));
  return {
    id: row.problem.id,
    code: row.problem.slug,
    slug: row.problem.slug,
    title: row.draft.title,
    category_id: row.draft.categoryId,
    category_name: row.categoryName,
    difficulty: row.draft.difficulty,
    description: parsed.content,
    constraints: "",
    expected_complexity: row.draft.expectedComplexity,
    time_limit: row.draft.timeLimitMs,
    memory_limit: row.draft.memoryLimitKb,
    points: row.draft.points,
    solution: row.draft.canonicalSolution,
    staff_notes: row.draft.staffNotes,
    tags: tagRows.map((tag) => tag.name),
    test_cases: tests.map((test) => ({ id: test.id, input_data: test.input, output_data: test.expectedOutput, case_order: test.caseOrder, is_simple: test.public, status: test.active })),
    published_revision: row.problem.publishedRevision,
  };
}

export async function listProblems(options: { search?: string; categoryId?: number; difficulty?: number; page: number; limit: number }) {
  const conditions = [eq(problems.state, "published")];
  if (options.difficulty) conditions.push(eq(problemRevisions.difficulty, options.difficulty));
  if (options.categoryId) conditions.push(eq(problemRevisions.categoryId, options.categoryId));
  if (options.search) conditions.push(sql`(${problems.slug} ilike ${`%${options.search}%`} or ${problemRevisions.title} ilike ${`%${options.search}%`})`);
  const where = and(...conditions);
  const [{ count }] = await getDb().select({ count: sql<number>`count(*)::int` }).from(problems).innerJoin(problemRevisions, and(eq(problemRevisions.problemId, problems.id), eq(problemRevisions.revision, problems.publishedRevision))).where(where);
  const rows = await getDb().select({ slug: problems.slug, title: problemRevisions.title, difficulty: problemRevisions.difficulty, points: problemRevisions.points, categoryId: problemRevisions.categoryId, categoryName: categories.name }).from(problems).innerJoin(problemRevisions, and(eq(problemRevisions.problemId, problems.id), eq(problemRevisions.revision, problems.publishedRevision))).leftJoin(categories, eq(problemRevisions.categoryId, categories.id)).where(where).orderBy(desc(problems.updatedAt)).limit(options.limit).offset((options.page - 1) * options.limit);
  return { data: rows.map((row) => ({ code: row.slug, slug: row.slug, title: row.title, difficulty: row.difficulty, points: row.points, category_id: row.categoryId, category_name: row.categoryName })), pagination: { page: options.page, limit: options.limit, total: count, total_pages: Math.ceil(count / options.limit) } };
}

export async function listAdminProblems(options: { search?: string; categoryId?: number; difficulty?: number; tagIds?: number[]; status?: string; page: number; limit: number }) {
  const conditions = [];
  if (options.difficulty) conditions.push(eq(problemDrafts.difficulty, options.difficulty));
  if (options.categoryId) conditions.push(eq(problemDrafts.categoryId, options.categoryId));
  if (options.search) conditions.push(sql`(${problems.slug} ilike ${`%${options.search}%`} or ${problemDrafts.title} ilike ${`%${options.search}%`})`);
  if (options.status === "1") conditions.push(eq(problems.state, "published"));
  if (options.status === "0") conditions.push(sql`${problems.state} <> 'published'`);
  const rows = await getDb().select({ problem: problems, draft: problemDrafts, categoryName: categories.name }).from(problems)
    .innerJoin(problemDrafts, eq(problemDrafts.problemId, problems.id))
    .leftJoin(categories, eq(problemDrafts.categoryId, categories.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(problems.updatedAt));
  const enriched = await Promise.all(rows.map(async ({ problem, draft, categoryName }) => {
    const tagRows = await getDb().select({ id: tags.id, name: tags.name }).from(draftTags).innerJoin(tags, eq(draftTags.tagId, tags.id)).where(eq(draftTags.problemId, problem.id));
    const markdown = matter(await readMarkdown(draft.markdownPath));
    return {
      code: problem.slug,
      slug: problem.slug,
      title: draft.title,
      category_id: draft.categoryId,
      category_name: categoryName,
      difficulty: draft.difficulty,
      description: markdown.content,
      constraints: "",
      solution: draft.canonicalSolution,
      expected_complexity: draft.expectedComplexity,
      time_limit: draft.timeLimitMs,
      memory_limit: draft.memoryLimitKb,
      points: draft.points,
      status: problem.state === "published",
      state: problem.state,
      tags: tagRows.map((tag) => tag.name),
      tagIds: tagRows.map((tag) => tag.id),
    };
  }));
  const filtered = options.tagIds?.length ? enriched.filter((row) => options.tagIds!.every((id) => row.tagIds.includes(id))) : enriched;
  const total = filtered.length;
  return { data: filtered.slice((options.page - 1) * options.limit, options.page * options.limit).map(({ tagIds, ...row }) => { void tagIds; return row; }), pagination: { page: options.page, limit: options.limit, total, total_pages: Math.ceil(total / options.limit) } };
}

export async function setProblemPublished(slug: string, published: boolean) {
  const [problem] = await getDb().select().from(problems).where(eq(problems.slug, slug)).limit(1);
  if (!problem) throw new DomainError("NOT_FOUND", "ไม่พบ Problem");
  if (published && problem.publishedRevision === null) throw new DomainError("CONFLICT", "ต้อง publish revision แรกก่อนเปิดใช้งาน Problem");
  const state = published ? "published" : "archived";
  await getDb().update(problems).set({ state, updatedAt: new Date() }).where(eq(problems.id, problem.id));
  return { slug, state, status: published };
}

export async function archiveProblem(slug: string) {
  const result = await setProblemPublished(slug, false);
  return { ...result, message: `เก็บ Problem ${slug} เป็นรายการถาวรแล้ว` };
}

export async function revisionHistory(slug: string) {
  const [problem] = await getDb().select().from(problems).where(eq(problems.slug, slug)).limit(1);
  if (!problem) throw new DomainError("NOT_FOUND", "ไม่พบ Problem");
  return getDb().select({ revision: problemRevisions.revision, checksum: problemRevisions.checksum, publishedAt: problemRevisions.publishedAt, publishedBy: problemRevisions.publishedBy }).from(problemRevisions).where(eq(problemRevisions.problemId, problem.id)).orderBy(desc(problemRevisions.revision));
}

export async function indexStatus(slug: string) {
  const [problem] = await getDb().select().from(problems).where(eq(problems.slug, slug)).limit(1);
  if (!problem) throw new DomainError("NOT_FOUND", "ไม่พบ Problem");
  return getDb().select().from(aiIndexJobs).where(eq(aiIndexJobs.problemId, problem.id)).orderBy(desc(aiIndexJobs.createdAt));
}
