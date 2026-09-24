---
"@sereno-ds/ui": minor
---

`SidebarNav` can now disable destinations (SS-286) — `disabled` on
`SidebarNav.Item`, on `SidebarNav.SubItem`, and on the `SidebarNav` root to
lock the whole menu at once. Purely additive.

- **Root vs item**: an `Item` inherits the root's `disabled` when it doesn't
  set its own, and an explicit `disabled={false}` opts back in — a "Help"
  link can stay reachable while everything else is locked. A `SubItem`
  inherits from its parent `Item`, so an enabled parent isn't re-locked
  underneath. The collapse toggle, `header` and `footer` are not destinations
  and stay live under a disabled root.
- **Accessibility**: `aria-disabled` (not the native attribute), so a disabled
  row is still in the accessibility tree — but it leaves the Tab order, since
  a locked menu shouldn't cost one dead tab stop per item (a whole disabled
  menu would be ~30). A click never fires `onChange`, `href` never navigates
  (a disabled item renders as a `<button>`, never through `linkComponent`), a
  disabled parent neither toggles its accordion nor opens its rail flyout
  (the plain label tooltip still shows).
- **Current page**: a disabled item can still be the current page — `value`
  pointing at it keeps `aria-current` and the active look, just muted, and the
  branch holding a disabled current `SubItem` stays open so you can still see
  where you are.
- **Look**: `--text-disabled`, `cursor: not-allowed`, no hover — the same
  tokens as `Menu` items.
