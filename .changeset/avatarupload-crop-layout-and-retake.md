---
"@sereno-ds/ui": minor
---

`AvatarUpload`'s crop modal (SS-322, reported testing the schedule-system app, across
several rounds of live testing):

- **Fixed, the crop square not lining up with the dialog**: it used to be a fixed
  280×280 box, `alignSelf: 'center'` (doing nothing: its parent, `Dialog.Body`, is a
  plain block container, not flex or grid) inside a `margin: '0 auto'` fix that
  centered it but left it narrower than, and misaligned with, the title and the
  footer buttons either side of it. It's `width: 100%` now, exactly as wide as
  everything else in the dialog and square via `aspectRatio`, so it needs no
  separate mobile handling either.
- **Fixed, the displayed photo not filling that square on the very first open**: the
  square's own live size drives the crop math (pan, zoom, the exported region) via a
  `ResizeObserver`, since it no longer has a fixed pixel size to key off. A plain
  `useRef` read once, in a mount effect, could still see `null` right then (`Dialog`
  renders its children only from the render *after* its own internal `mounted` state
  flips) and never retry, leaving the crop math stuck at a smaller guess than the
  real, larger box that had already rendered onscreen: a gray gap on two edges. A
  callback ref (kept as state) is what actually fixed it; a live resize (a phone
  rotated) rescales the pan so the framed crop doesn't jump.
- **New**: a shot taken with the camera now gets a **Retake** button on the crop
  step, back to the live camera without going through the menu again. A file picked
  from the library doesn't get it: cancelling and picking another one is already one
  click away. New `labels.retake` string (English default: "Retake").
- The crop and camera dialogs now build their Cancel / Save / Capture / Retake
  buttons from `Button` itself, not a bespoke inline style. That style was missing
  horizontal padding entirely (invisible while `flex: 1` always stretched the button
  past its own content; real once three buttons needed to share the row, each
  sized to its own content, exposing the missing padding). The crop dialog is also a
  little wider (400 vs. camera's 352) so three real buttons have the room.
- The math of the crop itself (zoom, pan, the export in `save()`) was checked
  separately against a test image and is correct; unrelated to this change.
