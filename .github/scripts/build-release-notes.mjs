#!/usr/bin/env node
// Builds the body for the GitHub Release release.yml creates for each publish.
// Title is just `vX.Y.Z` (the tag); this script only writes the notes body.
//
// Preferred source: apps/docs/src/design-system/CHANGELOG.md — the hand-written
// narrative log (one `## X.Y.Z — Title (SS-xxx)` section per version, added by
// whoever wrote the changeset). Falls back to the machine-generated
// packages/ui/CHANGELOG.md (+ packages/tokens/CHANGELOG.md, only if it has real
// content beyond the version heading) if no narrative entry exists yet, so a
// missed doc update never blocks a release that already published to npm.
//
// Usage: node .github/scripts/build-release-notes.mjs <version> <outFile>

import { readFileSync, writeFileSync, existsSync } from "node:fs";

const [, , version, outFile] = process.argv;
if (!version || !outFile) {
  console.error("usage: build-release-notes.mjs <version> <outFile>");
  process.exit(1);
}

/** Lines of the first `## <heading-prefix>...` section in `file`, heading line included. */
function section(file, headingPrefix) {
  if (!existsSync(file)) return null;
  const lines = readFileSync(file, "utf8").split("\n");
  const start = lines.findIndex((l) => l.startsWith(headingPrefix));
  if (start === -1) return null;
  const rest = lines.slice(start + 1);
  const relEnd = rest.findIndex((l) => l.startsWith("## "));
  const end = relEnd === -1 ? lines.length : start + 1 + relEnd;
  return lines.slice(start, end);
}

let body = "";

const narrative = section(
  "apps/docs/src/design-system/CHANGELOG.md",
  `## ${version}`
);
if (narrative) {
  // Drop the "X.Y.Z — " prefix off the heading — the release title already
  // carries the version, so only the narrative title (if any) stays.
  const versionEscaped = version.replace(/\./g, "\\.");
  narrative[0] = narrative[0]
    .replace(new RegExp(`^## ${versionEscaped}(?: — )?`), "## ")
    .trimEnd();
  if (narrative[0] === "##") narrative.shift();
  body = narrative.join("\n").trim();
}

if (!body) {
  const ui = section("packages/ui/CHANGELOG.md", `## ${version}`) ?? [];
  const tokens = section("packages/tokens/CHANGELOG.md", `## ${version}`) ?? [];
  const uiBody = ui.slice(1).join("\n").trim();
  const tokensBody = tokens.slice(1).join("\n").trim();
  body = uiBody;
  if (tokensBody) body += `\n\n### @sereno-ds/tokens\n\n${tokensBody}`;
}

writeFileSync(outFile, (body || `Published \`v${version}\`.`) + "\n");
