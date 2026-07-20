import { z } from "zod";
import { getConfig } from "@/server/config";
import { DomainError } from "@/server/domain/errors";

const embedResponse = z.object({ embeddings: z.array(z.array(z.number())) });

export async function embedTexts(input: string[]) {
  const response = await fetch(`${getConfig().OLLAMA_URL}/api/embed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: getConfig().OLLAMA_EMBED_MODEL, input }),
    cache: "no-store",
  });
  if (!response.ok) throw new DomainError("UPSTREAM_FAILURE", `Ollama embedding ตอบกลับ HTTP ${response.status}`);
  const vectors = embedResponse.parse(await response.json()).embeddings;
  if (vectors.some((vector) => vector.length !== getConfig().EMBEDDING_DIMENSIONS)) throw new DomainError("UPSTREAM_FAILURE", "ขนาด embedding จาก Ollama ไม่ตรงกับ schema");
  return vectors;
}

export async function streamChat(messages: { role: "system" | "user" | "assistant"; content: string }[]) {
  const response = await fetch(`${getConfig().OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: getConfig().OLLAMA_CHAT_MODEL, messages, stream: true }),
    cache: "no-store",
  });
  if (!response.ok || !response.body) throw new DomainError("UPSTREAM_FAILURE", `Ollama chat ตอบกลับ HTTP ${response.status}`);
  return response.body;
}
