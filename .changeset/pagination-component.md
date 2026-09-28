---
"@sereno-ds/ui": minor
---

New **`Pagination`** component (SS-325): page navigation for a long list or a `Table`.
The `Table` never paginates for you, so there was nothing to put under it.

- **Controlled**: `page` (1-based), `pageCount`, `onPageChange`. You slice the rows and
  compute the count; the DS only renders the control.
- **Stable width**: the run of page numbers keeps the same number of slots wherever the
  current page is (an ellipsis takes the room of a page button), so it does not jump as
  you page. An ellipsis only ever hides two or more pages. `siblingCount` and
  `boundaryCount` tune the window; `showEdges` adds first / last buttons.
- **Built from the DS's own control**: every button is an `IconButton`, page numbers
  included, so they are fixed squares (`size` `sm` / `md` / `lg` = 32 / 40 / 48px) and
  "9" and "10" take the same room. Also `disabled`.
- **Accessible from the start**: a named `<nav>`, `aria-current="page"` on the current
  page, accessible names ("Page 3"), previous / next disabled at the ends, and a polite
  "Page X of Y" announcement after a change.
- **Phone-friendly**: under 560px (`--bp-sm`) the numbers fold away and it becomes
  previous / "Page X of Y" / next. This is the one bit of new CSS, in `styles.css`.
- **Localisable**: English by default, every string overridable through `labels`.
