---
"@sereno-ds/ui": patch
---

`SearchInput`: the `onKeyDown` you pass is no longer silently dropped.

The component spread your props and then set its own `onKeyDown` (for `Enter` and `Esc`), which replaced yours: a handler passed to `SearchInput` never ran. It now runs first, on every key, and calling `preventDefault()` there says the key was handled, so the built-in `Enter` (search now) and `Esc` (clear) are skipped. Without a handler nothing changes. `Input` and `Textarea` already composed their handlers this way; this was the one left. Anyone who had worked around it with a wrapper element keeps working.
