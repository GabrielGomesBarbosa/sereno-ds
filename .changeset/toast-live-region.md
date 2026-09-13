---
"@sereno-ds/ui": patch
---

`ToastProvider` now announces through two persistent, visually-hidden
`aria-live` regions (`polite` for success/warning/info/neutral, `assertive`
for the `error` tone) instead of relying only on `role="status"`/`role="alert"`
on the freshly-mounted toast card. A live region only reliably announces a
*change* to already-present content — a node that mounts fresh with its text
already inside it (what every toast card does) isn't consistently announced
across browsers/screen readers. Part of the SS-227 accessibility audit
(SS-229). `Alert` needed no change — it already uses the correct
`role="status"`/`"alert"` pattern, and (unlike `ToastProvider`) has no owned
mount lifecycle to attach a persistent announcer to.
