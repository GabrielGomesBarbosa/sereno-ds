---
"@sereno-ds/ui": minor
---

The group labels of a `SidebarNav` pass the WCAG AA text contrast of 4.5:1 (#155).

A `SidebarNav.Section` label (11 px, bold, uppercase) was drawn with `--text-disabled`, the colour of an inactive control. WCAG exempts inactive controls from the contrast rule, but a group label is read text, so it measured 2.53:1 in the light theme (`#9ba3b3` on white) and 2.66:1 in the dark one. It now uses `--text-muted` (5.45:1 in light, 5.76:1 in dark), the same colour as the items under it.

What changes for an app: the labels are a little darker in light and a little lighter in dark, so a screenshot or visual test of a screen with a `SidebarNav` that has section labels changes by those pixels. The disabled items of the nav keep `--text-disabled`, on purpose. Found by the axe run in the docs (#142); the two entries it had in its baseline for this are gone.
