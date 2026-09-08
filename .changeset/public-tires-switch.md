---
"@sereno-ds/ui": patch
---

`TopBar`: the subtitle now truncates with an ellipsis like the title instead of
wrapping to multiple lines and blowing out the bar height on narrow screens.
`subtitle` also accepts `React.ReactNode` now (not just `string`), so consumers
can pass a `<time>` element or CSS-swapped responsive text.
