---
"@sereno-ds/ui": minor
---

`SidebarNav`, `BottomNav`, `Stepper`, `Dialog` and `TopBar` are now compound
components (SS-213), matching `Table` / `Tabs`. **Breaking** (pre-1.0, no
external consumer yet — PO decision 2026-09-12): the old config-array /
config-prop APIs are gone.

- `SidebarNav` — sections/items are no longer a data prop; compose
  `SidebarNav.Section` / `SidebarNav.Item` / `SidebarNav.SubItem` as children.
- `BottomNav` — an `items` array is now `BottomNav.Item` children.
- `Stepper` — a `steps: string[]` prop is now `Stepper.Step` children (each
  taking its own `label`).
- `Dialog` — `title` / `description` / `footer` / `showClose` props are gone.
  Compose `Dialog.Header` (`title` / `description` still live here, plus
  `children` for extra content or `Dialog.Close`), `Dialog.Body` and
  `Dialog.Footer`. Nothing renders a close button unless you place
  `<Dialog.Close />` yourself.
- `TopBar` — `leading` / `actions` config props are now `TopBar.Leading` /
  `TopBar.Title` / `TopBar.Actions` children, each an independent optional
  slot.

`Select` and `DateTimePicker` were evaluated for the same treatment (SS-225)
and intentionally kept on their config-prop API (`options`, `times`) — see
`AGENTS.md` for the reasoning.

See each component's own JSDoc (or the showcase) for the full new shape.
