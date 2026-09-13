---
"@sereno-ds/ui": patch
---

`Dialog` now traps `Tab`/`Shift+Tab` inside the panel while open (it
previously let keyboard focus escape into the page behind it) and restores
focus to whatever triggered it once closed. Every consumer gets this for
free — `AvatarUpload`'s crop/camera dialogs included. Part of the SS-227
accessibility audit (SS-231).
