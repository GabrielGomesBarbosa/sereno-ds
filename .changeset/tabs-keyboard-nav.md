---
"@sereno-ds/ui": patch
---

`Tabs` gains proper keyboard navigation (SS-228) — until now `Tabs.Tab` had
`role="tab"`/`role="tablist"` but no keyboard support behind it: every tab
was its own Tab stop, no arrow-key movement, and (independently) its focus
ring was suppressed with nothing replacing it. Now: only the active tab is
ever `tabIndex={0}` (Tab enters/leaves the whole strip in one stop), Left/Right
move focus between tabs and select them (matching the existing "click selects
immediately" contract), wrapping at the ends; Home/End jump to the first/last
tab. Matches the WAI-ARIA Tabs (automatic activation) pattern.
