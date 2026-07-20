import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // The flattened legacy UI still contains effect-driven loading state and
    // broad response payloads. Keep them visible as refactor debt without
    // blocking the full-stack migration verification.
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Independently versioned repositories run their own checks.
    "utils/**",
  ]),
]);

export default eslintConfig;
