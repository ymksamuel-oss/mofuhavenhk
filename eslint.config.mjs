import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    linterOptions: {
      reportUnusedDisableDirectives: "off",
    },
    rules: {
      "react-hooks/set-state-in-effect": "off",
      // User-provided and admin preview images intentionally bypass Vercel's paid optimizer.
      "@next/next/no-img-element": "off",
      // Legacy admin/import routes intentionally retain compatibility fields and callbacks.
      "@typescript-eslint/no-unused-vars": "off",
      "react-hooks/exhaustive-deps": "off",
      "jsx-a11y/role-supports-aria-props": "off",
      "import/no-anonymous-default-export": "off",
    },
  },
  globalIgnores([
    ".next/**",
    ".validation-build/**",
    "client/**",
    "node_modules/**",
    "coverage/**",
    "*.tsbuildinfo",
  ]),
]);
