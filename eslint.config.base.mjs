import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";

export default tseslint.config(
  {
    ignores: [
      "logs",
      "*.log",
      "npm-debug.log*",
      "node_modules",
      ".DS_Store",
      "dist",
      "dist-ssr",
      "coverage",
      "*.local",
      ".vscode/*",
      "!.vscode/extensions.json",
      "/src/extensions/**/*",
      "!/src/extensions/index.ts",
    ],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  prettierConfig,
  {
    languageOptions: {
      ecmaVersion: 12,
      sourceType: "module",
      globals: {
        ...globals.es2021,
        ...globals.node,
      },
    },
    rules: {
      "no-constant-binary-expression": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-unused-expressions": "warn",
    },
  }
);
