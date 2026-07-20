import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function readEnv(relativePath: string) {
  return new Map(
    readFileSync(join(process.cwd(), relativePath), "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const separator = line.indexOf("=");
        return [line.slice(0, separator), line.slice(separator + 1)] as const;
      }),
  );
}

describe("external utility configuration", () => {
  it("keeps provisioned Piston packages compatible with the app allowlist", () => {
    const app = readEnv(".env.example");
    const executor = readEnv("utils/executor/.env.example");
    const exposedNames = new Map([
      ["node", "javascript"],
      ["gcc", "c++"],
    ]);
    const provisioned = executor
      .get("PISTON_INSTALL_PACKAGES")!
      .split(",")
      .map((spec) => {
        const [packageName, version] = spec.split("=");
        return `${exposedNames.get(packageName) ?? packageName}:${version}`;
      })
      .sort();

    expect(provisioned).toEqual(app.get("PISTON_LANGUAGES")!.split(",").sort());
  });

  it("keeps Ollama model defaults aligned with the chatbot utility", () => {
    const app = readEnv(".env.example");
    const chatbot = readEnv("utils/chatbot/.env.example");

    expect(chatbot.get("OLLAMA_CHAT_MODEL")).toBe(app.get("OLLAMA_CHAT_MODEL"));
    expect(chatbot.get("OLLAMA_EMBED_MODEL")).toBe(app.get("OLLAMA_EMBED_MODEL"));
  });
});
