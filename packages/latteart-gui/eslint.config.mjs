import js from "@eslint/js";
import vue from "eslint-plugin-vue";
import vuetify from "eslint-plugin-vuetify";
import vueTsEslintConfig from "@vue/eslint-config-typescript";
import skipFormattingConfig from "@vue/eslint-config-prettier/skip-formatting";

export default [
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
      "!/src/extensions/index.ts"
    ]
  },
  js.configs.recommended,
  ...vue.configs["flat/base"],
  ...vuetify.configs["flat/base"],
  ...vueTsEslintConfig(),
  skipFormattingConfig,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-unused-expressions": "warn"
    }
  }
];
