/**
 * Fails when any git-tracked text file contains an em dash (U+2014).
 *
 * The project does not use it anywhere: text the user reads gets a period, comma or colon
 * (never a plain swap of the character), comments and developer docs use a spaced hyphen, and
 * a "no value" placeholder is `-` (SS-330). This is the guard that keeps it from creeping back.
 *
 * The character is built from its code point below, so this file does not trip its own check.
 * Run: `npm run check:dashes` (also a step of the CI workflow).
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const EM_DASH = String.fromCharCode(0x2014);

const files = execFileSync('git', ['ls-files', '-z'], { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 })
  .toString('utf8')
  .split('\0')
  .filter(Boolean);

const hits = [];
for (const file of files) {
  let buf;
  try {
    buf = readFileSync(join(ROOT, file));
  } catch {
    continue; // listed but deleted in the working tree
  }
  if (buf.includes(0)) continue; // binary (PNG, ...): a stray byte sequence is not text
  const lines = buf.toString('utf8').split('\n');
  lines.forEach((line, i) => {
    if (line.includes(EM_DASH)) hits.push(`${file}:${i + 1}: ${line.trim().slice(0, 100)}`);
  });
}

if (hits.length) {
  console.error(`check-no-em-dash: ${hits.length} line(s) with an em dash (U+2014).`);
  console.error('Use a period, comma or colon in text people read, a spaced hyphen in comments and dev docs, "-" as a no-value placeholder.\n');
  console.error(hits.join('\n'));
  process.exit(1);
}
console.log(`check-no-em-dash: ok (${files.length} tracked files).`);
