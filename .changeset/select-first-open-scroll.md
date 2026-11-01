---
"@sereno-ds/ui": patch
---

`Select` opens on the selected option the first time too (SS-568).

With a value already chosen in a long list (a time like `09:00`, a city like `Lisbon`), the panel opened at the top of the list the first time and only the second time was scrolled to the selected option. On a mouse the list is rendered one render after the panel opens (its placement has to be measured first), and the effect that scrolls the active option into view ran before it existed, so it found nothing and did nothing. The second time the placement was still remembered and the list was there at once. The touch sheet was never affected.

It now scrolls to the active option as soon as the list exists, before the first paint (no frame at the top), and again only when the active option itself changes (the keyboard, the pointer). It does not scroll again when the placement or the options change: a list the app pages from a server grows while the panel is open, and a user who scrolled down to ask for the next page is not pulled back to the selected option.

Nothing else changes. The scroll is still `scrollIntoView({ block: 'nearest' })`, so the selected option lands where it already did on the second open. A selected value that is not among the loaded options still shows the placeholder (the trigger takes its label from `options`): when a server pages the list, keep the selected option in it.
