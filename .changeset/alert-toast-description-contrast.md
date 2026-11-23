---
"@sereno-ds/ui": minor
---

The description of an `Alert` and of a `Toast` passes the WCAG AA text contrast of 4.5:1 in every tone (#156).

The body of an `Alert` was drawn with `opacity: 0.9` and the description of a `Toast` with `opacity: 0.85`, over the tone's own tinted background. The opacity lightened text that was already close to the limit: in the light theme it measured 4.13:1 (success), 4.44:1 (warning) and 4.22:1 (error) in an `Alert`, and 3.79:1 (success) in a `Toast`; the `info` tone of a `Toast` was at 4.22:1 too, though no docs example shows it. The opacity is gone, so the text now has the full contrast of the tone: at least 4.97:1 in light and 6.61:1 in dark, for all five tones of both components. The title above it is larger and bolder, so the hierarchy holds without it.

What changes for an app: the description text is a little stronger than before, in every tone and both themes, so a screenshot or visual test of a screen with an `Alert` or a `Toast` that has a body changes by those pixels. Found by the axe run in the docs (#142); its baseline for this is now empty. Not changed here: the dismiss "x" of both components is still drawn at `opacity: 0.6`.
