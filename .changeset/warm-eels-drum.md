---
"@sereno-ds/ui": patch
---

`Select` — the touch bottom sheet now locks page scroll while it's open (the
page was still scrollable behind it), and the list uses `overscroll-behavior:
contain` so reaching its end doesn't scroll the page.

`Dialog` — the header ✕ is larger and higher-contrast, and grows further on
`variant="fullscreen"` (40px, on a faint chip) where it's the only way out.
