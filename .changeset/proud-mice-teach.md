---
"@sereno-ds/ui": minor
---

`Stepper` no longer embeds pt-BR copy. The counter (was a hardcoded
`Passo N de M`) now comes from `stepLabel?: (current, total) => ReactNode` —
default `Step N of M` (English; the DS ships no localised text). Return `null`
to drop the counter and show only the step label. Consumers in another language
pass their own: `stepLabel={(c, t) => \`Passo \${c} de \${t}\`}`.
