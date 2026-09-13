---
"@sereno-ds/ui": patch
---

`Tabs.Tab`'s `count` badge now uses `--text-secondary` instead of
`--text-muted` for its inactive-tab color — on `--bg-subtle` (the
`underline` variant's inactive badge background) `--text-muted` lands at
~4.27:1, under the 4.5:1 body-text minimum (WCAG AA), a violation of the
Tokens page's own documented rule for that pair ("`--text-muted` on
`--bg-subtle`/`--bg-sunken` — large text only; use `--text-secondary` for
body copy"). Also now matches the inactive tab label's own color, which was
already `--text-secondary`. Part of the SS-227 accessibility audit (SS-230).
