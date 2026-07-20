import { and, asc, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/server/db/client";
import { problemRevisions, problems, submissions, testCases, testResults } from "@/server/db/schema";
import { DomainError } from "@/server/domain/errors";
import { executeCode } from "@/server/executor/piston";
import { recordAcceptedProgress } from "@/server/progress/module";

const submitInput = z.object({
  problemSlug: z.string().min(1),
  language: z.string().min(1),
  sourceCode: z.string().min(1),
});

function output(value: string) { return value.replace(/\r\n/g, "\n").trimEnd(); }

async function publishedProblem(slug: string) {
  const [row] = await getDb().select({ problem: problems, revision: problemRevisions }).from(problems).innerJoin(problemRevisions, and(eq(problemRevisions.problemId, problems.id), eq(problemRevisions.revision, problems.publishedRevision))).where(and(eq(problems.slug, slug), eq(problems.state, "published"))).limit(1);
  if (!row) throw new DomainError("NOT_FOUND", "ไม่พบ Problem ที่เผยแพร่แล้ว");
  return row;
}

async function runCases(language: string, sourceCode: string, cases: (typeof testCases.$inferSelect)[], limits: { timeLimitMs: number; memoryLimitKb: number }) {
  const results = [];
  for (const test of cases) {
    const run = await executeCode({ language, sourceCode, stdin: test.input, ...limits });
    results.push({ test, run, passed: run.code === 0 && output(run.stdout) === output(test.expectedOutput) });
  }
  return results;
}

export async function runPublicTests(input: unknown) {
  const data = submitInput.parse(input);
  const { problemSlug: slug, sourceCode } = data;
  const { revision } = await publishedProblem(slug);
  const cases = await getDb().select().from(testCases).where(and(eq(testCases.revisionId, revision.id), eq(testCases.public, true), eq(testCases.active, true))).orderBy(asc(testCases.caseOrder));
  const results = await runCases(data.language, sourceCode, cases, { timeLimitMs: revision.timeLimitMs, memoryLimitKb: revision.memoryLimitKb });
  const passed = results.filter((result) => result.passed).length;
  return {
    problem_slug: slug,
    language: data.language,
    score_percent: results.length ? (passed / results.length) * 100 : 0,
    results: results.map(({ test, run, passed: casePassed }) => ({ test_case_id: test.id, case_order: test.caseOrder, input_data: test.input, expected_output: test.expectedOutput, passed: casePassed, status: casePassed ? 3 : 4, error_message: run.stderr || null, memory_used: 0, output_data: run.stdout, run_time: 0 })),
    summary: { tests_total: results.length, tests_passed: passed, tests_wrong_answer: results.length - passed, tests_error: results.filter((result) => result.run.code !== 0).length, avg_run_time_ms: 0, avg_memory_used_bytes: 0 },
  };
}

export async function submit(input: unknown, userId: number) {
  const data = submitInput.parse(input);
  const { problemSlug: slug, sourceCode } = data;
  const { problem, revision } = await publishedProblem(slug);
  const [submission] = await getDb().insert(submissions).values({ userId, problemId: problem.id, revisionId: revision.id, language: data.language, sourceCode, status: "running" }).returning();
  const cases = await getDb().select().from(testCases).where(and(eq(testCases.revisionId, revision.id), eq(testCases.active, true))).orderBy(asc(testCases.caseOrder));
  try {
    const results = await runCases(data.language, sourceCode, cases, { timeLimitMs: revision.timeLimitMs, memoryLimitKb: revision.memoryLimitKb });
    const passedCount = results.filter((result) => result.passed).length;
    const accepted = cases.length > 0 && passedCount === cases.length;
    const scorePercent = cases.length ? (passedCount / cases.length) * 100 : 0;
    await getDb().transaction(async (tx) => {
      if (results.length) await tx.insert(testResults).values(results.map(({ test, run, passed }) => ({ submissionId: submission.id, testCaseId: test.id, passed, actualOutput: run.stdout || run.stderr })));
      await tx.update(submissions).set({ status: accepted ? "accepted" : "wrong_answer", scorePercent }).where(eq(submissions.id, submission.id));
    });
    const progress = accepted ? await recordAcceptedProgress(userId, submission.id, revision.points) : undefined;
    return { id: submission.id, pid: submission.id, score_percent: scorePercent, status: accepted ? 3 : 4, hidden_tests_run: cases.filter((test) => !test.public).length, submission_test_cases: results.map(({ test, passed }) => ({ test_case_id: test.id, status: passed ? 3 : 4, is_passed: passed })), progress };
  } catch (error) {
    await getDb().update(submissions).set({ status: "system_error" }).where(eq(submissions.id, submission.id));
    throw error;
  }
}

export async function listSubmissions(userId: number, options: { slug?: string; page: number; limit: number }) {
  const conditions = [eq(submissions.userId, userId)];
  if (options.slug) conditions.push(eq(problems.slug, options.slug));
  const rows = await getDb().select({ id: submissions.id, answer: submissions.sourceCode, language: submissions.language, status: submissions.status, score_percent: submissions.scorePercent, created_at: submissions.createdAt, problem_slug: problems.slug }).from(submissions).innerJoin(problems, eq(submissions.problemId, problems.id)).where(and(...conditions)).orderBy(desc(submissions.createdAt)).limit(options.limit).offset((options.page - 1) * options.limit);
  return { data: rows, pagination: { page: options.page, limit: options.limit } };
}
