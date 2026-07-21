import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  serial,
  text,
  timestamp,
  unique,
  uuid,
  vector,
} from "drizzle-orm/pg-core";

export const roleName = pgEnum("role_name", ["learner", "admin"]);
export const problemState = pgEnum("problem_state", ["draft", "published", "archived"]);
export const submissionState = pgEnum("submission_state", ["queued", "running", "accepted", "wrong_answer", "runtime_error", "time_limit", "system_error"]);
export const indexJobState = pgEnum("index_job_state", ["pending", "running", "retry", "complete", "failed", "stale"]);

export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: roleName("name").notNull().unique(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  authUserId: uuid("auth_user_id").notNull().unique(),
  roleId: integer("role_id").notNull().references(() => roles.id),
  emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }).notNull().defaultNow(),
  profileImagePath: text("profile_image_path"),
  bio: text("bio").notNull().default(""),
  phone: text("phone").notNull().default(""),
  dateOfBirth: text("date_of_birth"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull().default(""),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const problems = pgTable("problems", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  state: problemState("state").notNull().default("draft"),
  publishedRevision: integer("published_revision"),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const problemDrafts = pgTable("problem_drafts", {
  problemId: uuid("problem_id").primaryKey().references(() => problems.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  difficulty: integer("difficulty").notNull().default(1),
  markdownPath: text("markdown_path").notNull(),
  checksum: text("checksum").notNull(),
  expectedComplexity: text("expected_complexity"),
  timeLimitMs: integer("time_limit_ms").notNull().default(1000),
  memoryLimitKb: integer("memory_limit_kb").notNull().default(65536),
  points: integer("points").notNull().default(100),
  canonicalSolution: text("canonical_solution"),
  staffNotes: text("staff_notes"),
  updatedBy: integer("updated_by").notNull().references(() => users.id),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  check("problem_drafts_difficulty_check", sql`${table.difficulty} between 1 and 3`),
  check("problem_drafts_limits_check", sql`${table.timeLimitMs} > 0 and ${table.memoryLimitKb} > 0`),
]);

export const problemRevisions = pgTable("problem_revisions", {
  id: uuid("id").primaryKey().defaultRandom(),
  problemId: uuid("problem_id").notNull().references(() => problems.id, { onDelete: "cascade" }),
  revision: integer("revision").notNull(),
  title: text("title").notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  difficulty: integer("difficulty").notNull(),
  markdownPath: text("markdown_path").notNull(),
  checksum: text("checksum").notNull(),
  expectedComplexity: text("expected_complexity"),
  timeLimitMs: integer("time_limit_ms").notNull(),
  memoryLimitKb: integer("memory_limit_kb").notNull(),
  points: integer("points").notNull(),
  canonicalSolution: text("canonical_solution"),
  staffNotes: text("staff_notes"),
  publishedBy: integer("published_by").notNull().references(() => users.id),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [unique("problem_revisions_number_unique").on(table.problemId, table.revision)]);

export const draftTags = pgTable("problem_draft_tags", {
  problemId: uuid("problem_id").notNull().references(() => problems.id, { onDelete: "cascade" }),
  tagId: integer("tag_id").notNull().references(() => tags.id),
}, (table) => [primaryKey({ columns: [table.problemId, table.tagId] })]);

export const revisionTags = pgTable("problem_revision_tags", {
  revisionId: uuid("revision_id").notNull().references(() => problemRevisions.id, { onDelete: "cascade" }),
  tagId: integer("tag_id").notNull().references(() => tags.id),
}, (table) => [primaryKey({ columns: [table.revisionId, table.tagId] })]);

export const testCases = pgTable("test_cases", {
  id: uuid("id").primaryKey().defaultRandom(),
  problemId: uuid("problem_id").references(() => problems.id, { onDelete: "cascade" }),
  revisionId: uuid("revision_id").references(() => problemRevisions.id, { onDelete: "cascade" }),
  caseOrder: integer("case_order").notNull(),
  input: text("input").notNull(),
  expectedOutput: text("expected_output").notNull(),
  public: boolean("public").notNull().default(false),
  active: boolean("active").notNull().default(true),
}, (table) => [
  check("test_cases_owner_check", sql`num_nonnulls(${table.problemId}, ${table.revisionId}) = 1`),
  unique("test_cases_draft_order_unique").on(table.problemId, table.caseOrder),
  unique("test_cases_revision_order_unique").on(table.revisionId, table.caseOrder),
]);

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  problemId: uuid("problem_id").notNull().references(() => problems.id),
  revisionId: uuid("revision_id").notNull().references(() => problemRevisions.id),
  language: text("language").notNull(),
  sourceCode: text("source_code").notNull(),
  status: submissionState("status").notNull().default("queued"),
  scorePercent: real("score_percent").notNull().default(0),
  runtimeMs: integer("runtime_ms"),
  memoryBytes: integer("memory_bytes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("submissions_user_problem_idx").on(table.userId, table.problemId)]);

export const testResults = pgTable("test_results", {
  id: serial("id").primaryKey(),
  submissionId: integer("submission_id").notNull().references(() => submissions.id, { onDelete: "cascade" }),
  testCaseId: uuid("test_case_id").notNull().references(() => testCases.id),
  passed: boolean("passed").notNull(),
  actualOutput: text("actual_output"),
  runtimeMs: integer("runtime_ms"),
  memoryBytes: integer("memory_bytes"),
}, (table) => [unique("test_results_submission_case_unique").on(table.submissionId, table.testCaseId)]);

export const pointsLedger = pgTable("points_ledger", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  problemId: uuid("problem_id").notNull().references(() => problems.id),
  submissionId: integer("submission_id").references(() => submissions.id),
  reason: text("reason").notNull(),
  points: integer("points").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [unique("points_ledger_award_unique").on(table.userId, table.problemId, table.reason)]);

export const achievementDefinitions = pgTable("achievement_definitions", {
  key: text("key").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  criterion: jsonb("criterion").notNull(),
  sortOrder: integer("sort_order").notNull(),
});

export const earnedAchievements = pgTable("earned_achievements", {
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  achievementKey: text("achievement_key").notNull().references(() => achievementDefinitions.key),
  submissionId: integer("submission_id").references(() => submissions.id),
  earnedAt: timestamp("earned_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [primaryKey({ columns: [table.userId, table.achievementKey] })]);

export const userStreaks = pgTable("user_streaks", {
  userId: integer("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  currentDays: integer("current_days").notNull().default(0),
  longestDays: integer("longest_days").notNull().default(0),
  lastActiveDay: text("last_active_day"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const aiIndexJobs = pgTable("ai_index_jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  problemId: uuid("problem_id").notNull().references(() => problems.id, { onDelete: "cascade" }),
  revisionId: uuid("revision_id").notNull().references(() => problemRevisions.id, { onDelete: "cascade" }),
  checksum: text("checksum").notNull(),
  embeddingVersion: text("embedding_version").notNull(),
  state: indexJobState("state").notNull().default("pending"),
  attempts: integer("attempts").notNull().default(0),
  availableAt: timestamp("available_at", { withTimezone: true }).notNull().defaultNow(),
  lockedAt: timestamp("locked_at", { withTimezone: true }),
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
}, (table) => [
  unique("ai_index_jobs_idempotency_unique").on(table.problemId, table.revisionId, table.checksum, table.embeddingVersion),
  index("ai_index_jobs_claim_idx").on(table.state, table.availableAt),
]);

export const problemChunks = pgTable("problem_chunks", {
  id: uuid("id").primaryKey().defaultRandom(),
  problemId: uuid("problem_id").notNull().references(() => problems.id, { onDelete: "cascade" }),
  revisionId: uuid("revision_id").notNull().references(() => problemRevisions.id, { onDelete: "cascade" }),
  ordinal: integer("ordinal").notNull(),
  heading: text("heading"),
  content: text("content").notNull(),
  checksum: text("checksum").notNull(),
  embeddingVersion: text("embedding_version").notNull(),
  embedding: vector("embedding", { dimensions: 768 }).notNull(),
  metadata: jsonb("metadata").notNull().default({}),
}, (table) => [
  unique("problem_chunks_revision_ordinal_unique").on(table.revisionId, table.embeddingVersion, table.ordinal),
  index("problem_chunks_embedding_idx").using("hnsw", table.embedding.op("vector_cosine_ops")),
]);
