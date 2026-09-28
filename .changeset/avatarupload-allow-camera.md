---
"@sereno-ds/ui": minor
---

`AvatarUpload`: add `allowCamera?: boolean` prop (defaults to `true`).

- When `allowCamera={false}`:
  - Omits the camera ("Take a photo") option from the action menu.
  - If no photo/logo is currently selected, clicking the trigger button opens the native file selector directly rather than showing a 1-item menu dropdown.
  - If a photo/logo is already set, clicking the trigger button opens the menu showing only the upload and remove options.
  - Useful for company/organization/brand logos where capturing a live webcam/camera photo makes no sense.
