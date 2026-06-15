import { existsSync, rmSync } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();

const pathsToRemove = [
  path.join(rootDir, "frontend", "node_modules"),
  path.join(rootDir, "backend", "node_modules"),
  path.join(rootDir, "frontend", ".next"),
];

for (const target of pathsToRemove) {
  if (!existsSync(target)) {
    console.log(`skip ${path.relative(rootDir, target)}: not found`);
    continue;
  }

  rmSync(target, { recursive: true, force: true });
  console.log(`removed ${path.relative(rootDir, target)}`);
}

console.log("\nUninstall complete.");
console.log("Kept env files unchanged:");
console.log("- frontend/.env.local");
console.log("- backend/.env");
