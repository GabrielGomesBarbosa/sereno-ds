---
"@sereno-ds/ui": patch
---

`DateTimePicker`'s day grid now uses roving tabindex instead of every day
being its own Tab stop — Tab enters/leaves the whole grid in one stop, and
arrow keys move the cursor by day (←/→) or week (↑/↓), crossing month
boundaries on overflow. Home/End move within the current week row;
PageUp/PageDown step the month. An `unavailable` day stays focusable
(`aria-disabled`, not the native `disabled`, which can't receive focus at
all) so the cursor can land on it without being able to select it. Part of
the SS-227 accessibility audit (SS-228) — calendars were flagged as the
hardest keyboard-navigation case in the whole component set.
