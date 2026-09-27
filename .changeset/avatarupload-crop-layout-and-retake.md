---
"@sereno-ds/ui": minor
---

`AvatarUpload`'s crop modal (SS-322, reported testing the schedule-system app):

- **Fixed**: the crop square drifted to the left edge instead of centering, and the
  zoom bar sat flush against it with no gap. `CropStage` (shared by the crop and
  camera modals) relied on `alignSelf: 'center'`, but its parent, `Dialog.Body`, is a
  plain block container, not flex or grid, where `alignSelf` alone does nothing.
  `margin: '0 auto'`, which does work in block flow, fixes both modals at once; the
  zoom row gets a top margin.
- **New**: a shot taken with the camera now gets a **Retake** button on the crop
  step, back to the live camera without going through the menu again. A file picked
  from the library doesn't get it: cancelling and picking another one is already one
  click away. New `labels.retake` string (English default: "Retake").
- The math of the crop itself (zoom, pan, the export in `save()`) was checked
  separately against a test image and is correct; unrelated to this change.
