import path from "node:path";
import { spawn } from "node:child_process";

const rootDir = process.cwd();

const services = [
  { name: "frontend", dir: path.join(rootDir, "frontend") },
  { name: "backend", dir: path.join(rootDir, "backend") },
];

const children = [];
let shuttingDown = false;

function prefixStream(stream, prefix) {
  let buffered = "";

  stream.on("data", (chunk) => {
    buffered += chunk.toString();
    const lines = buffered.split(/\r?\n/);
    buffered = lines.pop() ?? "";

    for (const line of lines) {
      if (line.length > 0) {
        console.log(`[${prefix}] ${line}`);
      }
    }
  });

  stream.on("end", () => {
    if (buffered.length > 0) {
      console.log(`[${prefix}] ${buffered}`);
    }
  });
}

function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }

  setTimeout(() => {
    for (const child of children) {
      if (!child.killed) {
        child.kill("SIGKILL");
      }
    }
    process.exit(exitCode);
  }, 1000).unref();
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => shutdown(0));
}

for (const service of services) {
  const child = spawn("npm", ["run", "dev"], {
    cwd: service.dir,
    stdio: ["inherit", "pipe", "pipe"],
    shell: process.platform === "win32",
  });

  children.push(child);
  prefixStream(child.stdout, service.name);
  prefixStream(child.stderr, service.name);

  child.on("exit", (code, signal) => {
    if (shuttingDown) {
      return;
    }

    const reason = signal ? `signal ${signal}` : `exit code ${code}`;
    console.error(`[${service.name}] stopped with ${reason}`);
    shutdown(code ?? 1);
  });

  child.on("error", (error) => {
    console.error(`[${service.name}] failed to start: ${error.message}`);
    shutdown(1);
  });
}

console.log("Starting frontend and backend...");
