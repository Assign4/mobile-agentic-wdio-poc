import eslint from "@eslint/js";
import prettier from "eslint-config-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";

const tsRecommended = tseslint.configs.recommended.map((c) => ({
  ...c,
  files: ["**/*.ts"],
}));

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "coverage/**",
      "apps/**",
      "artifacts/**",
      "reports/**",
      ".appium/**",
      "packages/mobile-wdio-kit/template/**",
      "patches/**",
    ],
  },
  {
    files: ["**/*.mjs", "eslint.config.js"],
    ...eslint.configs.recommended,
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.node },
    },
  },
  {
    files: ["**/*.ts"],
    ...eslint.configs.recommended,
  },
  ...tsRecommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["**/*.test.ts", "**/*.spec.ts"],
    languageOptions: {
      globals: { ...globals.mocha },
    },
  },
  {
    files: ["configs/**/*.ts"],
    languageOptions: {
      globals: { browser: "readonly" },
    },
  },
  prettier,
);
