---
"@sereno/ui": minor
---

New `ToastProvider` + `useToast()` — the toast *system* on top of the
presentational `Toast`. Wrap the app once in `<ToastProvider position=… max=…
duration=…>`; call `const { toast, dismiss } = useToast()` anywhere below it.

- `toast('Link copied')` / `toast.success('Saved', { description })` /
  `toast.error(…)` / `toast.warning` / `toast.info` — each returns an id.
- Portalled fixed viewport, all six `position`s (`top`/`bottom` × `left`/`center`/`right`),
  newest nearest the edge.
- A countdown bar on each timed toast; it and the auto-dismiss timer pause
  together while the toast is hovered or focused. `duration` defaults to
  4000 ms; `duration: 0` keeps it until `dismiss(id)`.
- Stack caps at `max` (default 3) — the oldest drops.
- `dismiss()` with no id clears all. Error toasts announce as `role="alert"`.

`Toast` gains an opt-in `progress={{ ms, paused }}` prop for that bar (the
provider wires it). Adds the `sereno-toast-*` keyframes to
`@sereno/ui/styles.css`.
