---
"@sereno/ui": patch
---

`Dialog` now portals to `<body>` and is fixed to the viewport, so it always
covers the whole screen instead of being trapped inside the nearest scrolling
or positioned ancestor. While open it also locks page scroll, closes on
`Escape`, and moves focus into the panel. No API change.
