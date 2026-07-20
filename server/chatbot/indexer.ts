import matter from "gray-matter";
import { and, eq } from "drizzle-orm";
import { getDb, getSqlClient } from "@/server/db/client";
import { aiIndexJobs, problemChunks, problemRevisions, problems } from "@/server/db/schema";
import { readMarkdown } from "@/server/problems/file-store";
import { embedTexts } from "@/server/chatbot/ollama";

export function learnerSafeIndexText(markdown: string) {
  const { content, data } = matter(markdown);
  const metadata = [
    typeof data.title === "string" ? `# ${data.title}` : "",
    Array.isArray(data.tags) && data.tags.length ? `Tags: ${data.tags.filter((value): value is string => typeof value === "string").join(", ")}` : "",
    Array.isArray(data.objectives) && data.objectives.length ? `## Learning objectives\n${data.objectives.filter((value): value is string => typeof value === "string").map((value) => `- ${value}`).join("\n")}` : "",
    Array.isArray(data.hints) && data.hints.length ? `## Tutor hints\n${data.hints.filter((value): value is string => typeof value === "string").map((value) => `- ${value}`).join("\n")}` : "",
    Array.isArray(data.publicExamples) && data.publicExamples.length ? `## Public examples\n${data.publicExamples.map((value) => JSON.stringify(value)).join("\n")}` : "",
  ].filter(Boolean).join("\n\n");
  return [metadata, content.trim()].filter(Boolean).join("\n\n");
}

function chunks(markdown: string) {
  const projected = learnerSafeIndexText(markdown);
  const sections = projected.split(/(?=^#{1,3}\s+)/m).map((part) => part.trim()).filter(Boolean);
  return sections.flatMap((section) => section.length <= 1_500 ? [section] : section.match(/[\s\S]{1,1500}(?:\s|$)/g)?.map((part) => part.trim()).filter(Boolean) ?? []);
}

export async function claimIndexJob() {
  const sql = getSqlClient();
  const [job] = await sql.begin(async (tx) => {
    const [row] = await tx<{ id: string }[]>`
      select id from ai_index_jobs
      where (state in ('pending', 'retry') and available_at <= now())
         or (state = 'running' and locked_at < now() - interval '5 minutes')
      order by created_at
      for update skip locked limit 1
    `;
    if (!row) return [];
    return tx<{ id: string }[]>`
      update ai_index_jobs set state = 'running', locked_at = now(), attempts = attempts + 1
      where id = ${row.id} returning id
    `;
  });
  return job?.id;
}

export async function processIndexJob(jobId: string) {
  const db = getDb();
  const [job] = await db.select().from(aiIndexJobs).where(eq(aiIndexJobs.id, jobId)).limit(1);
  if (!job) return;
  try {
    const [row] = await db.select({ revision: problemRevisions, currentRevision: problems.publishedRevision }).from(problemRevisions).innerJoin(problems, eq(problemRevisions.problemId, problems.id)).where(eq(problemRevisions.id, job.revisionId)).limit(1);
    if (!row || row.currentRevision !== row.revision.revision || row.revision.checksum !== job.checksum) {
      await db.update(aiIndexJobs).set({ state: "stale", completedAt: new Date(), error: "Revision is no longer current" }).where(eq(aiIndexJobs.id, job.id));
      return;
    }
    const markdown = await readMarkdown(row.revision.markdownPath);
    const parts = chunks(markdown);
    const vectors = await embedTexts(parts);
    await db.transaction(async (tx) => {
      await tx.delete(problemChunks).where(and(eq(problemChunks.revisionId, job.revisionId), eq(problemChunks.embeddingVersion, job.embeddingVersion)));
      if (parts.length) await tx.insert(problemChunks).values(parts.map((content, ordinal) => ({ problemId: job.problemId, revisionId: job.revisionId, ordinal, content, checksum: job.checksum, embeddingVersion: job.embeddingVersion, embedding: vectors[ordinal], metadata: { revision: row.revision.revision } })));
      await tx.update(aiIndexJobs).set({ state: "complete", completedAt: new Date(), lockedAt: null, error: null }).where(eq(aiIndexJobs.id, job.id));
    });
  } catch (error) {
    const attempts = job.attempts;
    const failed = attempts >= 5;
    await db.update(aiIndexJobs).set({ state: failed ? "failed" : "retry", availableAt: new Date(Date.now() + Math.min(300, 2 ** attempts) * 1000), lockedAt: null, error: error instanceof Error ? error.message.slice(0, 2000) : String(error) }).where(eq(aiIndexJobs.id, job.id));
  }
}

export async function runWorker(signal?: AbortSignal) {
  while (!signal?.aborted) {
    const job = await claimIndexJob();
    if (job) await processIndexJob(job);
    else await new Promise((resolve) => setTimeout(resolve, 2_000));
  }
}
