import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// One flat config for the whole monorepo. Each workspace's `lint` script runs
// `eslint .`; ESLint walks up to find this file.
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // @sereno-ds/ui is a component library, not a Next app - silence the
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
    // tsup writes `tsup.config.bundled_<hash>.mjs` next to its config while it builds and deletes it right after. Turbo
    // runs `lint` and `build` of a workspace in parallel, so `eslint .` could list that file and then fail to read it
    // (ENOENT, exit code 2) - it took down the release gate once. A temporary file is never source: skip it.
    "**/tsup.config.bundled_*",
  ]),
]);

export default eslintConfig;
