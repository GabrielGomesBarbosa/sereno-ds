---
"@sereno-ds/ui": patch
---

`Select` gains an `aria-label` prop — its trigger is a real `<button>` (a
labelable element, so an associated `label` already worked correctly), but
without a visible `label` at all it had no accessible name. Caught in
`WeeklyScheduleEditor` (`apps/demo`): the per-day start/end time `Select`s
had neither `label` nor `aria-label`, so a screen reader announced a bare,
unnamed combobox. Part of the SS-227 accessibility audit (SS-229).
