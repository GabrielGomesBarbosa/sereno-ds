---
"@sereno-ds/ui": minor
---

New component: `ActionCard`, a whole card you press (SS-515).

Decision modals and settings flows show their options as cards. The DS had `Card interactive`, the bare surface, and every screen put the icon, the title, the line of explanation and the arrow together by hand. `ActionCard` is the finished control, in a real `<button>`.

- **`title`**, **`description`**, **`icon`** (any node, a `lucide-react` element in a tile on the left, hidden from a screen reader) and **`trailing`** (an arrow by default; any node, or `null` for nothing).
- **`variant`**: `default`, `primary` (the tile takes the primary color) and `error` (an error tile, title and ring; the same word `Button`, `Badge` and `Alert` use).
- **`disabled`**: the native attribute, so it cannot be clicked or focused; the text and the tile go to the disabled colors.
- **`selected`**: passing it (true or false) makes the card a toggle: it reports `aria-pressed` and, when true, wears the brand ring. Leave it out for a plain action. It is a toggle, not a radio: the arrow keys do not move between cards. "Choose exactly one" has a radio group's semantics, and is not part of this.
- Hover rings it in the variant's color (brand, or error) and tints it with 6% of that color over the surface, so the icon tile keeps showing (a grey fill the same as the tile's would swallow it); the keyboard focus ring is the DS `--focus-ring`; Enter and Space press it. `type` defaults to `button`.
- Everything a `button` takes (`onClick`, `className`, `style`, `aria-*`) goes to it, and your `style` comes last.

Only added to: `Card` is untouched.
