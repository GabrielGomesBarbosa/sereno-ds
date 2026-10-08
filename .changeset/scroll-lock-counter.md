---
"@sereno-ds/ui": patch
---

The page scroll no longer stays locked after a window closes (SS-402).

`Dialog`, the crop / camera step of `AvatarUpload` and the touch sheet of `Select` each locked the page scroll on their own: they remembered the `overflow` they found on `<html>` and `<body>`, set `hidden`, and put the remembered value back on close. `AvatarUpload` draws its step inside a `Dialog`, so it locked twice. The `Dialog` locked first (it found an empty value), then `AvatarUpload` locked (it found `hidden` and took it for the page's own value). On close the `Dialog` put the empty value back and `AvatarUpload` then put `hidden` back: the page could not scroll again, and because a client-side navigation does not reload it, neither could the next screen, until F5. Any two locks released in the wrong order did the same, and the one that closed first could also unlock the page behind a window that was still open.

- **One shared lock** (internal): the first holder records what the page had and sets `hidden`, every other holder just counts, and the last one to let go puts the recorded value back. The order does not matter, letting go twice is harmless, and what the page had (`auto`, `scroll`, ...) is what comes back.
- **Used by `Dialog` and by the touch sheet of `Select`**, in place of the duplicated code.
- **`AvatarUpload` no longer has a lock of its own.** Its step is drawn by the `Dialog`, which already locks the page and already closes on Escape, so the second lock and the second Escape handler are gone. Behaviour for a user is the same, except that the page is free again after Cancel, Save and Escape.
- No change to the public API.

If your app works around this (a guard that clears `overflow` on `<html>` and `<body>` after a window closes), it can go once you are on this version.
