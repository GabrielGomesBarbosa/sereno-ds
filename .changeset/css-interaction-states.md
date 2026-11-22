---
"@sereno-ds/ui": minor
---

`Button`, `IconButton` and `Card`: hover, press and keyboard focus are CSS now, not React state (SS-577).

Each component used to keep three `useState` and five mouse and focus handlers, and re-rendered on every hover. It now declares what each state looks like as custom properties on the element, and `styles.css` switches between them with `:hover`, `:active` and `:focus-visible`. The pictures are **identical** to before (all 1282 reference images of the visual tests, default, hover, pressed, focus and open, in light, dark and at phone width, show no pixel over the tests' rounding tolerance, see `docs/testing.md`).

What changes for an app:

- **You can restyle a state with plain CSS**, with no `!important`: the state rules have the specificity of `.sereno-btn:hover`, so a rule of yours with the same specificity that comes later wins. The hooks are the class `sereno-btn` (`Button`, `IconButton`) and `sereno-card` with `data-interactive` / `data-clickable` (`Card`). Documented in the package README. Overriding the token on the element (`.x { --interactive-ghost-hover: ... }`) keeps working.
- **`@sereno-ds/ui/styles.css` is now required for these three.** It always had to be imported, but a missing import used to leave their colours working (they were inline) and now leaves them unstyled. If an app imports it (as the README says), nothing to do.
- The focus ring is the browser's own `:focus-visible`, which also covers a press by keyboard (Space on a button), where the JS version only saw the mouse.
- `ActionCard`, the `SidebarNav` items and the hover handlers of `Menu`, `Select`, `Checkbox`, `Radio`, `AvatarUpload` and `ToastProvider` are not touched: they move over one at a time, each proven by the pixel tests.
