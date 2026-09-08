---
"@sereno-ds/ui": patch
---

`Alert` and `Toast` — the dismiss control is now a proper 28px icon button (a
Lucide `X`, hover/focus states) instead of a bare `×` glyph with no hit area.

Also adds dedicated behavioural tests for `Alert`, `Toast` and `Skeleton`
(SS-61 / SS-62) — test files, not shipped.
