import { createHash, randomUUID } from "node:crypto";
import { mkdir, open, readFile, rename, unlink } from "node:fs/promises";
import path from "node:path";
import { getConfig } from "@/server/config";

function absolute(relativePath: string) {
  const root = path.resolve(getConfig().APP_DATA_DIR);
  const target = path.resolve(root, relativePath);
  if (target !== root && !target.startsWith(`${root}${path.sep}`)) throw new Error("Unsafe data path");
  return target;
}

export function checksum(markdown: string) {
  return createHash("sha256").update(markdown, "utf8").digest("hex");
}

export async function readMarkdown(relativePath: string) {
  return readFile(absolute(relativePath), "utf8");
}

export async function readDataFile(relativePath: string) {
  return readFile(absolute(relativePath));
}

export async function atomicWrite(relativePath: string, content: string) {
  const target = absolute(relativePath);
  await mkdir(path.dirname(target), { recursive: true });
  const temporary = `${target}.${randomUUID()}.tmp`;
  const handle = await open(temporary, "wx", 0o600);
  try {
    await handle.writeFile(content, "utf8");
    await handle.sync();
  } finally {
    await handle.close();
  }
  await rename(temporary, target);
}

export async function atomicWriteData(relativePath: string, content: Uint8Array) {
  const target = absolute(relativePath);
  await mkdir(path.dirname(target), { recursive: true });
  const temporary = `${target}.${randomUUID()}.tmp`;
  const handle = await open(temporary, "wx", 0o600);
  try { await handle.writeFile(content); await handle.sync(); } finally { await handle.close(); }
  await rename(temporary, target);
}

export async function removeMarkdown(relativePath: string) {
  await unlink(absolute(relativePath)).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "ENOENT") throw error;
  });
}
