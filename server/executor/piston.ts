import { z } from "zod";
import { getAllowedLanguages, getConfig } from "@/server/config";
import { DomainError } from "@/server/domain/errors";

const executionInput = z.object({
  language: z.string().min(1),
  sourceCode: z.string().min(1).max(100_000),
  stdin: z.string().max(100_000).default(""),
  timeLimitMs: z.number().int().positive().max(60_000).optional(),
  memoryLimitKb: z.number().int().positive().max(4_194_304).optional(),
});

const pistonResponse = z.object({
  run: z.object({
    stdout: z.string().default(""),
    stderr: z.string().default(""),
    output: z.string().default(""),
    code: z.number().nullable().optional(),
    signal: z.string().nullable().optional(),
  }),
});

export type ExecutionInput = z.infer<typeof executionInput>;

export async function executeCode(raw: unknown) {
  const input = executionInput.parse(raw);
  const version = getAllowedLanguages().get(input.language);
  if (!version) throw new DomainError("BAD_REQUEST", `ภาษา ${input.language} ไม่อยู่ใน allowlist`);
  const runTimeoutMs = Math.min(input.timeLimitMs ?? getConfig().PISTON_RUN_TIMEOUT_MS, getConfig().PISTON_RUN_TIMEOUT_MS);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), getConfig().PISTON_RUN_TIMEOUT_MS);
  try {
    const response = await fetch(`${getConfig().PISTON_URL}/api/v2/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: input.language, version, files: [{ content: input.sourceCode }], stdin: input.stdin, run_timeout: runTimeoutMs, ...(input.memoryLimitKb ? { run_memory_limit: input.memoryLimitKb * 1024 } : {}) }),
      signal: controller.signal,
      cache: "no-store",
    });
    if (!response.ok) throw new DomainError("UPSTREAM_FAILURE", `Piston ตอบกลับ HTTP ${response.status}`);
    return pistonResponse.parse(await response.json()).run;
  } catch (error) {
    if (error instanceof DomainError) throw error;
    if (error instanceof Error && error.name === "AbortError") throw new DomainError("UPSTREAM_FAILURE", "Piston หมดเวลาประมวลผล");
    throw new DomainError("UPSTREAM_FAILURE", "ไม่สามารถเชื่อมต่อ Piston", error);
  } finally { clearTimeout(timeout); }
}
