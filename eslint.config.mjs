import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// One flat config for the whole monorepo. Each workspace's `lint` script runs
// `eslint .`; ESLint walks up to find this file.
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // @sereno-ds/ui is a component library, not a Next app — silence the
    // pages-dir lookup from this Next-app-only rule.
    files: ["packages/ui/**/*.{ts,tsx}"],
    rules: { "@next/next/no-html-link-for-pages": "off" },
  },
  globalIgnores([
    "**/.next/**",
    "**/out/**",
    "**/build/**",
    "**/dist/**",
    "**/node_modules/**",
    "**/next-env.d.ts",
    ".turbo/**",
  ]),
]);

export default eslintConfig;
