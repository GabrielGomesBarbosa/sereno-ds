---
"@sereno-ds/ui": minor
---

The border colour and the focus ring of `Input`, `Textarea`, `Select`, `DatePicker` and `Autocomplete` are CSS now, and so is the hover of the `SidebarNav` collapse control (SS-582, after SS-577 and SS-581).

`Input` and `Textarea` kept the focus in `useState` with an `onFocus` / `onBlur` pair and re-rendered on every focus and blur, and `Autocomplete` did the same. They now declare the colours as custom properties (`--sd-bd`, `--sd-bd-active`, `--sd-ring-active`) and `styles.css` lights the frame on `:focus`. The pictures are **identical** to before (the visual tests of every state, in light, dark and at phone width, show no pixel over the tests' rounding tolerance), except the one fix below.

What changes for an app:

- **`@sereno-ds/ui/styles.css` is now required for the text fields.** The border colour and the ring used to be inline, so a missing import left them working; now a missing import leaves the border in the browser's default colour and no ring. Every other control of the package already needed the stylesheet.
- **You can restyle a text field's frame with plain CSS**, with no `!important`: the class is `sereno-field` (on the `Input` row, the `Textarea`, and the boxes of `Select`, `DatePicker` and `Autocomplete`), `data-active` is set while a popup is open, and a `Textarea` or a text box inside the frame is matched by `:focus`. Documented in the package README.
- **`Input` and `Textarea` no longer wrap `onFocus` and `onBlur`.** Yours (or the one `register()` of react-hook-form injects) goes straight to the element. Nothing to change in your code.
- `Textarea` now merges a `className` you pass with its own `sereno-field`, as before it left yours alone.
- **Fix:** the hover of the `SidebarNav` collapse control (the round button on the edge of the rail) never showed, because its fill, ink and border were also set inline and an inline value beats the stylesheet. It now has the hover that was always written for it: the secondary hover fill, the primary text colour and the strong border.
