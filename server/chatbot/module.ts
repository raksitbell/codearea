import { and, cosineDistance, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/server/db/client";
import { problemChunks, problemRevisions, problems } from "@/server/db/schema";
import { DomainError } from "@/server/domain/errors";
import { embedTexts, streamChat } from "@/server/chatbot/ollama";
import { getConfig } from "@/server/config";

const chatInput = z.object({
  mode: z.enum(["hint", "compare", "analyze"]),
  problemSlug: z.string().min(1),
  message: z.string().optional(),
  code: z.string().max(100_000).optional(),
  oldCode: z.string().max(100_000).optional(),
  newCode: z.string().max(100_000).optional(),
});

export type TutorEvent =
  | { type: "meta"; mode: "hint" | "compare" | "analyze"; problemSlug: string }
  | { type: "citation"; id: string; ordinal: number; excerpt: string; score: number }
  | { type: "token"; token: string }
  | { type: "done" }
  | { type: "error"; message: string };

export async function prepareTutor(raw: unknown) {
  const data = chatInput.parse(raw);
  const slug = data.problemSlug;
  const question = data.message ?? "ช่วยแนะนำแนวทางแก้ Problem นี้";
  const [problem] = await getDb().select({ id: problems.id, revisionId: problemRevisions.id, title: problemRevisions.title }).from(problems).innerJoin(problemRevisions, and(eq(problemRevisions.problemId, problems.id), eq(problemRevisions.revision, problems.publishedRevision))).where(and(eq(problems.slug, slug), eq(problems.state, "published"))).limit(1);
  if (!problem) throw new DomainError("NOT_FOUND", "ไม่พบ Problem ที่เผยแพร่แล้ว");
  const [embedding] = await embedTexts([question]);
  const similarity = sql<number>`1 - (${cosineDistance(problemChunks.embedding, embedding)})`;
  const citations = await getDb().select({ id: problemChunks.id, ordinal: problemChunks.ordinal, content: problemChunks.content, score: similarity }).from(problemChunks).where(and(eq(problemChunks.revisionId, problem.revisionId), eq(problemChunks.embeddingVersion, getConfig().EMBEDDING_VERSION))).orderBy(desc(similarity)).limit(5);
  if (!citations.length) throw new DomainError("CONFLICT", "Problem นี้ยัง index ไม่เสร็จ");
  const codeContext = data.mode === "compare" ? `\nโค้ดเดิม:\n${data.oldCode ?? ""}\nโค้ดใหม่:\n${data.newCode ?? ""}` : `\nโค้ดผู้เรียน:\n${data.code ?? ""}`;
  const context = citations.map((item) => `[${item.ordinal + 1}] ${item.content}`).join("\n\n");
  const chat = await streamChat([
    { role: "system", content: "คุณคือ CodeArea AI Tutor ใช้เฉพาะบริบท learner-safe ที่ให้มา ห้ามเปิดเผยเฉลยเต็มหรือเดา hidden tests อ้างหมายเลขบริบทเมื่อให้คำแนะนำ" },
    { role: "user", content: `Problem: ${problem.title}\nMode: ${data.mode}\nคำถาม: ${question}${codeContext}\n\nบริบท:\n${context}` },
  ]);
  return { data, slug, citations, chat };
}

export async function tutorEvents(raw: unknown): Promise<AsyncGenerator<TutorEvent>> {
  const prepared = await prepareTutor(raw);
  async function* generate(): AsyncGenerator<TutorEvent> {
    yield { type: "meta", mode: prepared.data.mode, problemSlug: prepared.slug };
    for (const citation of prepared.citations) {
      yield { type: "citation", id: citation.id, ordinal: citation.ordinal, excerpt: citation.content.slice(0, 240), score: Number(citation.score) };
    }
    const reader = prepared.chat.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.trim()) continue;
        const payload = JSON.parse(line) as { message?: { content?: string } };
        const token = payload.message?.content;
        if (token) yield { type: "token", token };
      }
    }
    if (buffer.trim()) {
      const payload = JSON.parse(buffer) as { message?: { content?: string } };
      if (payload.message?.content) yield { type: "token", token: payload.message.content };
    }
    yield { type: "done" };
  }
  return generate();
}
