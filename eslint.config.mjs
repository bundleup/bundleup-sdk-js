import tseslint from "typescript-eslint";
import configPrettier from "eslint-config-prettier";
import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";

const eslintConfig = defineConfig([
  {
    name: "repo/ignores",
    ignores: [
      ".cache",
      ".idea",
      ".next",
      ".turbo",
      ".vscode",
      ".yalc",
      "!.*.js",
      "**/__tests__/**",
      "**/.turbo/*",
      "**/build/*",
      "**/coverage/*",
      "**/dist/*",
      "**/integration/templates/**/*",
      "**/node_modules/**",
      "*.snap",
      "commitlint.config.ts",
      "packages/*/dist/**",
      "packages/*/examples",
      "playground/*",
      "pnpm-lock.json",
      "eslint.config.mjs",
      "typedoc.config.mjs",
      "vitest.workspace.mjs",
    ],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  configPrettier,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
]);

export default eslintConfig;
