---
"@sereno-ds/ui": patch
---

Fixes two remaining spots (SS-228) where an inline `outline: 'none'` had no
visible substitute — the same bug already fixed on the DateTimePicker day
grid and Tabs, found by auditing every other inline `outline: 'none'` left
in the package: `DateTimePicker`'s time-slot buttons, and `BottomNav.Item`.
Both now suppress the outline via a CSS class instead, with a
`:focus-visible` rule at the same specificity re-enabling it.
