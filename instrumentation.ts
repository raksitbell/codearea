import { runWorker } from "@/server/chatbot/indexer";

declare global {
  var codeareaIndexWorkerStarted: boolean | undefined;
}

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || process.env.NEXT_PHASE === "phase-production-build") return;
  if (globalThis.codeareaIndexWorkerStarted) return;
  globalThis.codeareaIndexWorkerStarted = true;

  const controller = new AbortController();
  process.once("SIGTERM", () => controller.abort());
  process.once("SIGINT", () => controller.abort());
  void runWorker(controller.signal).catch((error) => {
    globalThis.codeareaIndexWorkerStarted = false;
    console.error("[index-worker] stopped unexpectedly", error);
  });
}
