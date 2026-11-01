---
"@sereno-ds/ui": minor
---

New `Autocomplete`: a single choice from a list you search by typing (SS-569).

`Select` stops being the right control past ~12 options, and it cannot serve a list the server searches and pages: its trigger takes its label from `options`, so a value on a page that is not loaded shows the placeholder, and it never tells the app the scroll reached the end. `Autocomplete` is the same field with a text box.

- **The value is the chosen row, `{ value, label }`, and it carries its own label.** The box shows `value.label` whether or not that row is in `options` right now, so a paged list shows the right name from the first render. `onValueChange` gives that row (or `null` when cleared), not a string.
- **Two kinds of search.** By default typing narrows `options` (case and accents ignored) and the first match is ready for `Enter`. With `filter={false}` the list is left to the server and `onSearch(query)` hands over what was typed, debounced (`debounce`, 250 ms). `onSearch` is never called with the chosen label, and it goes back to `''` when the box goes back to the label (pick, clear, leave, `Esc`), so the app can reload the unfiltered list and never has to guess.
- **Paging.** `onReachEnd` fires when the scroll is within about five rows of the end (or the list is too short to scroll), once per list size and never while `loading`. `loading` shows a lone spinner under the rows (or by itself) and sets `aria-busy`. Loading, no-result and the result count are announced to a screen reader.
- **Opens on the chosen row** (the same rule as `Select`, SS-568), also when the list loads after it opened and the user has not scrolled yet. A page that arrives while the list is open never moves it under a user who is scrolling.
- **Not free text.** What is typed never becomes the value; leaving the box puts the label back. A × and an emptied box clear the value (`clearable`).
- Full keyboard (`↑ ↓`, `Home` / `End`, `Enter`, `Esc`; `Esc` closes only the list when it sits in a `Dialog`), the WAI-ARIA combobox pattern, the usual field contract (`label`, `hint`, `error`, `required`, `size`, `disabled`, `name`, `aria-label`, `preserveHelperSpace`), `locale` (`pt-BR` / `en`) and `labels` for the built-in texts. Asks the browser autofill and the password managers to leave the box alone (`autoComplete="off"`, `data-1p-ignore`, `data-lpignore`, `data-bwignore`), best effort.

`Select` is unchanged: its list placement, its scroll to the active option and the look of its list and rows moved into shared internals that `Autocomplete` uses too (the rendered result was compared before and after, in the browser, for every `Select` example).
