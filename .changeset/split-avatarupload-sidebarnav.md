---
"@sereno-ds/ui": patch
---

`AvatarUpload` and `SidebarNav` are split into smaller files (SS-576). No visible change and no change to the API.

They were the two largest components of the package (849 and 806 lines), hard to review and to touch without breaking another part. The code was moved, not rewritten (every line is still there, checked by comparing the lines before and after):

- `AvatarUpload`: the camera (`useCamera`), the crop math (`useCropper`) and the capture dialog (`AvatarCaptureDialog`, with the crop stage) are now files of their own in `forms/_internal/`.
- `SidebarNav`: the context (`sidebarNavContext`), the section, item and sub-item (`SidebarNavItems`, with their prop types) and the submenu popover (`SidebarSubmenuPopover`) are now files of their own in `navigation/_internal/`. `SidebarNav.tsx` keeps the root and re-exports the prop types, so every import keeps working.
