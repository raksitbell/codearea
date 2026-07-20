import { closeDb } from "@/server/db/client";
import { runWorker } from "@/server/chatbot/indexer";

const controller = new AbortController();
process.once("SIGTERM", () => controller.abort());
process.once("SIGINT", () => controller.abort());

async function main() {
  await runWorker(controller.signal);
  await closeDb();
}

main().catch(async (error) => {
  console.error(error);
  await closeDb();
  process.exitCode = 1;
});
