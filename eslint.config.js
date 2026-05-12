//  @ts-check

import { tanstackConfig } from "@tanstack/eslint-config";
import eslintConfigPrettier from "eslint-config-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";

export default [
  ...tanstackConfig,
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },

    rules: {
      "import/no-cycle": "off",
      "import/order": "off",
      "sort-imports": "off",

      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",

      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/require-await": "off",
      "pnpm/json-enforce-catalog": "off",
    },
  },

  {
    ignores: ["eslint.config.js", "prettier.config.js"],
  },

  eslintConfigPrettier,
];
