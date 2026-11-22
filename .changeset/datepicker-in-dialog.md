---
"@sereno-ds/ui": patch
---

`DatePicker`: inside a `Dialog` the calendar is no longer cut off by the dialog's scrolling body.

The calendar was a plain absolute child of the field, so the dialog's `overflow` clipped it (only the first rows were visible, and the body grew a scrollbar). Inside a `position: fixed` container it is now drawn over the dialog like the lists of `Select` and `Autocomplete`: portalled to `<body>` through the same `useMenuPlacement`, kept inside the window (under the field if it fits, else above it, else as far up as it needs) and at most 320px wide, because its cells are square and a wide dialog field would otherwise make a slab that covers the field. Closing on scroll, `Esc` and the outside press behave as before. Since the calendar leaves the field's place in the DOM, `Tab` is handed over by hand: from the field into the calendar, and from the last element back out to whatever follows the field.

Nothing changes outside a dialog: the calendar is still an absolute child below the field, at the field's width, and no prop or export changed.
