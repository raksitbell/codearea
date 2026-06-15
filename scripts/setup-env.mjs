import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import {
  createEnvSchemas,
  parseEnvValues,
  writeEnvFile,
} from "./env-schema.mjs";

const rootDir = process.cwd();
const SECRET_KEY_PATTERN = /(SECRET|TOKEN|KEY|PASSWORD)/i;

function normalizeSelection(value) {
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return "both";
  }

  if (normalized === "frontend" || normalized === "backend" || normalized === "both") {
    return normalized;
  }

  return null;
}

function maskValue(value) {
  if (!value) {
    return "";
  }

  if (value.length <= 8) {
    return "********";
  }

  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function formatCurrentValue(entry, currentValue) {
  if (!currentValue) {
    return "";
  }

  if (SECRET_KEY_PATTERN.test(entry.key)) {
    return maskValue(currentValue);
  }

  return currentValue;
}

function getPromptLabel(entry, currentValue) {
  const baseLabel = entry.prompt || entry.key;
  const currentDisplay = formatCurrentValue(entry, currentValue);

  if (currentDisplay) {
    return `${baseLabel} [current: ${currentDisplay}, Enter to keep]`;
  }

  if (entry.skipByDefault) {
    return `${baseLabel} [optional, Enter to skip, example: ${entry.value}]`;
  }

  if (entry.generateDefault) {
    return `${baseLabel} [random default generated for this setup]`;
  }

  return `${baseLabel} [default: ${entry.value}]`;
}

async function askSelection(rl) {
  console.log("\nCodeArea env setup");
  console.log("------------------");
  console.log("1. frontend");
  console.log("2. backend");
  console.log("3. both");

  while (true) {
    const answer = await rl.question("\nSelect target [both]: ");
    const selection = normalizeSelection(answer);
    const numericSelection = {
      1: "frontend",
      2: "backend",
      3: "both",
    }[answer.trim()];

    if (numericSelection) {
      return numericSelection;
    }

    if (selection) {
      return selection;
    }

    console.log("Invalid choice. Use 1, 2, 3, frontend, backend, or both.");
  }
}

async function askEntryValue(rl, entry, currentValue) {
  while (true) {
    const label = getPromptLabel(entry, currentValue);
    const answer = await rl.question(`${entry.key}: ${label}: `);
    const trimmed = answer.trim();

    if (trimmed) {
      return trimmed;
    }

    if (currentValue) {
      return currentValue;
    }

    if (entry.skipByDefault) {
      return "";
    }

    if (entry.value) {
      return entry.value;
    }
  }
}

async function configureSchema(rl, schema) {
  const existingValues = parseEnvValues(schema.targetPath);
  const selectedValues = {};

  console.log(`\n${schema.targetLabel}`);
  console.log("-".repeat(schema.targetLabel.length));

  for (const section of schema.sections) {
    console.log(`\n[${section.title}]`);

    for (const entry of section.entries) {
      if (entry.generateDefault) {
        selectedValues[entry.key] = entry.value;
        const suffix = existingValues[entry.key] ? "rotated" : "generated";
        console.log(`${entry.key}: ${suffix} random value`);
        continue;
      }

      selectedValues[entry.key] = await askEntryValue(rl, entry, existingValues[entry.key]);
    }
  }

  writeEnvFile(schema, selectedValues, existingValues);
  console.log(`\nSaved ${schema.targetLabel}`);
}

const rl = createInterface({ input, output });

try {
  const selection = await askSelection(rl);
  const schemas = createEnvSchemas(rootDir);
  const selectedSchemas = schemas.filter((schema) => selection === "both" || schema.name === selection);

  for (const schema of selectedSchemas) {
    await configureSchema(rl, schema);
  }

  console.log("\nEnv setup complete.");
} catch (error) {
  console.error(`\nEnv setup failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  rl.close();
}
