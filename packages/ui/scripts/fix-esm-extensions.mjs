// tsup's `bundle: false` mode transpiles each file independently (esbuild
// "transform", not "bundle"), so it never rewrites import/export specifiers —
// relative ones come out exactly as written in source (no extension), which
// violates the Node ESM spec and breaks strict resolvers (Vitest, plain Node,
// ts-node). Bundler resolution (webpack/Next/Vite) tolerates it, which is why
// this went unnoticed. This appends the missing `.js` after every build.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const HAS_EXTENSION = /\.(js|mjs|cjs|json|css|node|wasm)$/;
// Matches `from '...'`, bare `import '...'`, and dynamic `import('...')`.
const SPECIFIER = /\b(from|import)(\s*\(?\s*)(['"])(\.\.?\/[^'"]+)\3/g;

async function collectJsFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return collectJsFiles(full);
      return entry.isFile() && entry.name.endsWith('.js') ? [full] : [];
    }),
  );
  return files.flat();
}

export async function fixEsmExtensions(distDir) {
  const files = await collectJsFiles(distDir);
  await Promise.all(
    files.map(async (file) => {
      const original = await readFile(file, 'utf8');
      const fixed = original.replace(SPECIFIER, (match, keyword, space, quote, specifier) =>
        HAS_EXTENSION.test(specifier) ? match : `${keyword}${space}${quote}${specifier}.js${quote}`,
      );
      if (fixed !== original) await writeFile(file, fixed);
    }),
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await fixEsmExtensions(path.resolve(import.meta.dirname, '../dist'));
}
