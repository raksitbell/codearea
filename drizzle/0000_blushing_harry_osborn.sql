CREATE EXTENSION IF NOT EXISTS vector;--> statement-breakpoint
CREATE TYPE "public"."index_job_state" AS ENUM('pending', 'running', 'retry', 'complete', 'failed', 'stale');--> statement-breakpoint
CREATE TYPE "public"."problem_state" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."role_name" AS ENUM('learner', 'admin');--> statement-breakpoint
CREATE TYPE "public"."submission_state" AS ENUM('queued', 'running', 'accepted', 'wrong_answer', 'runtime_error', 'time_limit', 'system_error');--> statement-breakpoint
CREATE TABLE "achievement_definitions" (
	"key" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"icon" text NOT NULL,
	"criterion" jsonb NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_index_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"problem_id" uuid NOT NULL,
	"revision_id" uuid NOT NULL,
	"checksum" text NOT NULL,
	"embedding_version" text NOT NULL,
	"state" "index_job_state" DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"available_at" timestamp with time zone DEFAULT now() NOT NULL,
	"locked_at" timestamp with time zone,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	CONSTRAINT "ai_index_jobs_idempotency_unique" UNIQUE("problem_id","revision_id","checksum","embedding_version")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "problem_draft_tags" (
	"problem_id" uuid NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "problem_draft_tags_problem_id_tag_id_pk" PRIMARY KEY("problem_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "earned_achievements" (
	"user_id" integer NOT NULL,
	"achievement_key" text NOT NULL,
	"submission_id" integer,
	"earned_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "earned_achievements_user_id_achievement_key_pk" PRIMARY KEY("user_id","achievement_key")
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "password_reset_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "points_ledger" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"submission_id" integer,
	"reason" text NOT NULL,
	"points" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "points_ledger_award_unique" UNIQUE("user_id","submission_id","reason")
);
--> statement-breakpoint
CREATE TABLE "problem_chunks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"problem_id" uuid NOT NULL,
	"revision_id" uuid NOT NULL,
	"ordinal" integer NOT NULL,
	"heading" text,
	"content" text NOT NULL,
	"checksum" text NOT NULL,
	"embedding_version" text NOT NULL,
	"embedding" vector(768) NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "problem_chunks_revision_ordinal_unique" UNIQUE("revision_id","embedding_version","ordinal")
);
--> statement-breakpoint
CREATE TABLE "problem_drafts" (
	"problem_id" uuid PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"category_id" integer,
	"difficulty" integer DEFAULT 1 NOT NULL,
	"markdown_path" text NOT NULL,
	"checksum" text NOT NULL,
	"expected_complexity" text,
	"time_limit_ms" integer DEFAULT 1000 NOT NULL,
	"memory_limit_kb" integer DEFAULT 65536 NOT NULL,
	"points" integer DEFAULT 100 NOT NULL,
	"canonical_solution" text,
	"staff_notes" text,
	"updated_by" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "problem_drafts_difficulty_check" CHECK ("problem_drafts"."difficulty" between 1 and 3),
	CONSTRAINT "problem_drafts_limits_check" CHECK ("problem_drafts"."time_limit_ms" > 0 and "problem_drafts"."memory_limit_kb" > 0)
);
--> statement-breakpoint
CREATE TABLE "problem_revisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"problem_id" uuid NOT NULL,
	"revision" integer NOT NULL,
	"title" text NOT NULL,
	"category_id" integer,
	"difficulty" integer NOT NULL,
	"markdown_path" text NOT NULL,
	"checksum" text NOT NULL,
	"expected_complexity" text,
	"time_limit_ms" integer NOT NULL,
	"memory_limit_kb" integer NOT NULL,
	"points" integer NOT NULL,
	"canonical_solution" text,
	"staff_notes" text,
	"published_by" integer NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "problem_revisions_number_unique" UNIQUE("problem_id","revision")
);
--> statement-breakpoint
CREATE TABLE "problems" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"state" "problem_state" DEFAULT 'draft' NOT NULL,
	"published_revision" integer,
	"created_by" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "problems_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "problem_revision_tags" (
	"revision_id" uuid NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "problem_revision_tags_revision_id_tag_id_pk" PRIMARY KEY("revision_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" "role_name" NOT NULL,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"problem_id" uuid NOT NULL,
	"revision_id" uuid NOT NULL,
	"language" text NOT NULL,
	"source_code" text NOT NULL,
	"status" "submission_state" DEFAULT 'queued' NOT NULL,
	"score_percent" real DEFAULT 0 NOT NULL,
	"runtime_ms" integer,
	"memory_bytes" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "test_cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"problem_id" uuid,
	"revision_id" uuid,
	"case_order" integer NOT NULL,
	"input" text NOT NULL,
	"expected_output" text NOT NULL,
	"public" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "test_cases_draft_order_unique" UNIQUE("problem_id","case_order"),
	CONSTRAINT "test_cases_revision_order_unique" UNIQUE("revision_id","case_order"),
	CONSTRAINT "test_cases_owner_check" CHECK (num_nonnulls("test_cases"."problem_id", "test_cases"."revision_id") = 1)
);
--> statement-breakpoint
CREATE TABLE "test_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"submission_id" integer NOT NULL,
	"test_case_id" uuid NOT NULL,
	"passed" boolean NOT NULL,
	"actual_output" text,
	"runtime_ms" integer,
	"memory_bytes" integer,
	CONSTRAINT "test_results_submission_case_unique" UNIQUE("submission_id","test_case_id")
);
--> statement-breakpoint
CREATE TABLE "user_streaks" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"current_days" integer DEFAULT 0 NOT NULL,
	"longest_days" integer DEFAULT 0 NOT NULL,
	"last_active_day" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"display_name" text NOT NULL,
	"password_hash" text NOT NULL,
	"role_id" integer NOT NULL,
	"profile_image_path" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "ai_index_jobs" ADD CONSTRAINT "ai_index_jobs_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_index_jobs" ADD CONSTRAINT "ai_index_jobs_revision_id_problem_revisions_id_fk" FOREIGN KEY ("revision_id") REFERENCES "public"."problem_revisions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problem_draft_tags" ADD CONSTRAINT "problem_draft_tags_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problem_draft_tags" ADD CONSTRAINT "problem_draft_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "earned_achievements" ADD CONSTRAINT "earned_achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "earned_achievements" ADD CONSTRAINT "earned_achievements_achievement_key_achievement_definitions_key_fk" FOREIGN KEY ("achievement_key") REFERENCES "public"."achievement_definitions"("key") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "earned_achievements" ADD CONSTRAINT "earned_achievements_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "points_ledger" ADD CONSTRAINT "points_ledger_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "points_ledger" ADD CONSTRAINT "points_ledger_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problem_chunks" ADD CONSTRAINT "problem_chunks_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problem_chunks" ADD CONSTRAINT "problem_chunks_revision_id_problem_revisions_id_fk" FOREIGN KEY ("revision_id") REFERENCES "public"."problem_revisions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problem_drafts" ADD CONSTRAINT "problem_drafts_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problem_drafts" ADD CONSTRAINT "problem_drafts_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problem_drafts" ADD CONSTRAINT "problem_drafts_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problem_revisions" ADD CONSTRAINT "problem_revisions_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problem_revisions" ADD CONSTRAINT "problem_revisions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problem_revisions" ADD CONSTRAINT "problem_revisions_published_by_users_id_fk" FOREIGN KEY ("published_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problems" ADD CONSTRAINT "problems_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problem_revision_tags" ADD CONSTRAINT "problem_revision_tags_revision_id_problem_revisions_id_fk" FOREIGN KEY ("revision_id") REFERENCES "public"."problem_revisions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problem_revision_tags" ADD CONSTRAINT "problem_revision_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_revision_id_problem_revisions_id_fk" FOREIGN KEY ("revision_id") REFERENCES "public"."problem_revisions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_cases" ADD CONSTRAINT "test_cases_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_cases" ADD CONSTRAINT "test_cases_revision_id_problem_revisions_id_fk" FOREIGN KEY ("revision_id") REFERENCES "public"."problem_revisions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_results" ADD CONSTRAINT "test_results_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_results" ADD CONSTRAINT "test_results_test_case_id_test_cases_id_fk" FOREIGN KEY ("test_case_id") REFERENCES "public"."test_cases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_streaks" ADD CONSTRAINT "user_streaks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_index_jobs_claim_idx" ON "ai_index_jobs" USING btree ("state","available_at");--> statement-breakpoint
CREATE INDEX "problem_chunks_embedding_idx" ON "problem_chunks" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "submissions_user_problem_idx" ON "submissions" USING btree ("user_id","problem_id");--> statement-breakpoint
INSERT INTO "roles" ("name") VALUES ('learner'), ('admin') ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO "achievement_definitions" ("key", "title", "description", "icon", "criterion", "sort_order") VALUES
  ('first-solve', 'First Solve', 'แก้ Problem แรกสำเร็จ', '🌱', '{"distinctProblems":1}', 10),
  ('ten-solves', 'Problem Solver', 'แก้ Problem ที่แตกต่างกัน 10 ข้อ', '🏆', '{"distinctProblems":10}', 20),
  ('polyglot-3', 'Polyglot', 'ผ่าน Problem ด้วย 3 ภาษา', '🧩', '{"distinctLanguages":3}', 30),
  ('streak-3', 'On Fire', 'รักษาสตรีค 3 วัน', '🔥', '{"streakDays":3}', 40),
  ('streak-7', 'Weekly Discipline', 'รักษาสตรีค 7 วัน', '⚡', '{"streakDays":7}', 50)
ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO "categories" ("name", "description") VALUES
  ('Algorithms', 'Problems ด้านอัลกอริทึม'),
  ('Data Structures', 'Problems ด้านโครงสร้างข้อมูล')
ON CONFLICT DO NOTHING;
