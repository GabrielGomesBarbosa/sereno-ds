---
"@sereno-ds/ui": minor
---

`ActionCard`, the `SidebarNav` rows, `Checkbox`, `Radio` and the actions of the `AvatarUpload` menu: hover, press and keyboard focus are CSS now, not React state (SS-577, after the `Button`, `IconButton` and `Card` pilot).

Each one used to keep hover (and, for `ActionCard`, press and focus) in `useState` and re-rendered when the pointer crossed it. It now declares what each state looks like as custom properties on the element, and `styles.css` switches between them with `:hover`, `:active` and `:focus-visible`. The pictures are **identical** to before (all the reference images of the visual tests, default, hover, pressed, focus and open, in light, dark and at phone width, show no pixel over the tests' rounding tolerance, see `docs/testing.md`).

What changes for an app:

- **You can restyle these states with plain CSS**, with no `!important`, the same way as the buttons: the hooks are the classes `sereno-action` (`ActionCard`), `sereno-sidenav-row` (`SidebarNav` items and sub items), `sereno-choice` on the row and `sereno-check` / `sereno-radio` on the box (`Checkbox`, `Radio`) and `sereno-menuitem` (the `AvatarUpload` actions). Documented in the package README.
- **`@sereno-ds/ui/styles.css` is now required for `ActionCard`** (the other four already needed it). A missing import used to leave its colours working, because they were inline, and now leaves it without fill and ring.
- The `<label>` of a `Checkbox` or `Radio` now has the class `sereno-choice`, and the border colour of the box comes from `.sereno-check` / `.sereno-radio`, not from an inline `border`. The idle, hover and error colours are the same as before.
- `ActionCard`'s focus ring is the browser's own `:focus-visible`, which also covers a press by keyboard.
- The internal `useInteract` hook is gone (it was never exported from the package).
- `Menu`, `Select` and `ToastProvider` are not touched on purpose: what they do on hover is behaviour (the active option the keyboard continues from, the pause of the dismiss timer), not looks, and CSS cannot carry it.
