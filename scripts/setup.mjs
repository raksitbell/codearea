import { spawn } from "node:child_process";
import { ensureEnvSchemas } from "./env-schema.mjs";

const rootDir = process.cwd();

const projects = [
  { name: "frontend", dir: `${rootDir}/frontend` },
  { name: "backend", dir: `${rootDir}/backend` },
];

function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: "inherit",
      shell: process.platform === "win32",
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} failed with exit code ${code}`));
    });

    child.on("error", reject);
  });
}

async function installDependencies() {
  for (const project of projects) {
    console.log(`\nInstalling ${project.name} dependencies...`);
    await runCommand("npm", ["install"], project.dir);
  }
}

async function main() {
  const majorNodeVersion = Number.parseInt(process.versions.node.split(".")[0], 10);
  if (Number.isNaN(majorNodeVersion) || majorNodeVersion < 18) {
    throw new Error(`Node.js 18+ required. Current version: ${process.versions.node}`);
  }

  ensureEnvSchemas(rootDir);
  await installDependencies();

  console.log("\nSetup complete.");
  console.log("Env files ready:");
  console.log("- frontend/.env.local");
  console.log("- backend/.env");
  console.log("\nStart both apps with: npm run dev");
}

main().catch((error) => {
  console.error(`\nSetup failed: ${error.message}`);
  process.exitCode = 1;
});
