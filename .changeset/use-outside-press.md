---
"@sereno-ds/ui": patch
---

One shared way to close a popup on a press outside it (SS-575). No visible change.

`Select`, `Menu`, `Autocomplete`, `DatePicker` and the month / year popover of the calendar each had their own copy of the same listener ("close when the pointer goes down outside these elements"). They now share `_internal/useOutsidePress`, which listens on `document` in the capture phase and reads its refs and callback when the event arrives. The placement of the `Menu` is not touched: it is not a copy of the one `Select` and `Autocomplete` share (it always sits fixed, aligns to either side of its button, spans the width on a phone), so it stays its own.
