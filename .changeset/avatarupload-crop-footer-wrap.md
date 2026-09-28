---
"@sereno-ds/ui": patch
---

`AvatarUpload`: the crop dialog's footer no longer wraps with a lone, small "Salvar" pushed to the right (SS-326).

With three actions (Retake, Cancel, Save) and pt-BR labels ("Tirar outra", "Cancelar", "Gravar"), the row needs about 384px and the crop dialog gave it 358px, so the last button, the primary one, dropped to a second line by itself.

- **Wider dialogs**: the crop dialog goes from 400px to 440px, so the three pt-BR buttons share one line with room to spare, and the camera dialog (352px) matches it, since a shot goes straight from one to the other and the dialog should not change size between the steps. Every other `Dialog` is untouched.
- **One dialog for the whole photo flow**: the camera, the crop and Retake are now steps of a single `Dialog` whose title, image area and buttons swap, instead of one dialog closing and another opening. The panel no longer replays its pop-in between steps, keeps its size and position, and focus stays inside it (it used to be handed back to the page and pulled in again). The camera is switched off as soon as the dialog leaves that step. Behaviour and props of `AvatarUpload` are unchanged.
- **New `Dialog.Footer` prop `fill`** (off by default, so no existing dialog changes): the buttons share the row and grow to fill it, and each line if they wrap, instead of hugging the right edge. A wrap on a phone now reads as intended: at 375px it is two buttons on the first line and a full-width primary below, at 320px a full-width first button and the other two below, never a small primary alone at the right. Buttons keep their 40px height and are still the real `Button`, no `size="sm"`.
- The crop footer turns `fill` on only when there are three actions (after a camera shot). A library pick has two and stays right-aligned as before.
- Use `fill` on any footer with long or translated labels, or three or more actions.
