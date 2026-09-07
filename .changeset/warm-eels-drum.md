---
"@sereno/ui": patch
---

`Select` — the touch bottom sheet now locks page scroll while it's open (the
page was still scrollable behind it), and the list uses `overscroll-behavior:
contain` so reaching its end doesn't scroll the page.
