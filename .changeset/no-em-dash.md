---
"@sereno-ds/ui": patch
---

The em dash (U+2014) is gone from the whole repository (SS-330): the showcase and demo texts, the component docs and comments, the READMEs, the package descriptions, the CHANGELOGs and the generated `DESIGN_SYSTEM.md`. Text people read was rewritten with a period, comma or colon (not a plain swap of the character), comments and developer docs use a spaced hyphen, and a "no value" placeholder is `-`.

Where it shows in what ships:

- **`DateTimePicker`'s time-slot accessible name** (set when a slot has a `capacity`) now separates the time from the count with a comma (`09:00, 3 vagas`) where it used an em dash. If your tests find a slot by that exact name, update the separator.
- The npm package descriptions of `@sereno-ds/ui` and `@sereno-ds/tokens` read `Sereno Design System: ...`.
- The narrative `CHANGELOG.md` titles each version `## X.Y.Z - Title`, and the release-notes script strips that prefix.

`npm run check:dashes` (a CI step) now fails if one comes back.
