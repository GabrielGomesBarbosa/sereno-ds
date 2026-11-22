import type { ComponentMeta } from '../catalog';
import { R } from './_shared';

export const avatarUploadMeta: ComponentMeta = {
  slug: 'avatar-upload',
  name: 'AvatarUpload',
  category: 'forms',
  summary: 'Profile-photo picker: an avatar disc with a pencil button, a library / camera / remove menu, and a circular crop. Hands back a cropped, downscaled JPEG.',
  props: [
    R('name', 'string', 'Full name: the initials fallback and the alt text.'),
    R('value', 'File | string | null', 'The current photo: a `File` (freshly cropped) or an existing URL string.'),
    R('onChange', '(file: File | null) => void', 'The cropped JPEG `File`, or `null` on remove.'),
    R('size', 'number', 'Disc diameter in px.', '96'),
    R('outputSize', 'number', 'The crop is drawn to this square size before export.', '512'),
    R('maxSizeMB', 'number', 'Picks larger than this are rejected (before crop).', '8'),
    R('labels', 'Partial<AvatarUploadLabels>', 'Override the English UI strings: menu, crop dialog, error messages.'),
    R('allowCamera', 'boolean', 'Whether to allow taking a photo via camera (omit "Take a photo" option and camera modal). Useful for logos.', 'true'),
    R('label / hint / error / required / disabled', '-', 'Same label contract as Input. The `aria-invalid` / `aria-describedby` wiring is on the pencil button, since the file input itself is hidden. A rejected pick (type, size, unreadable) counts as an error. `required` draws the asterisk only: the pencil is a button, which cannot carry `aria-required`.'),
    R('preserveHelperSpace', 'boolean', "Reserve the hint/error row's height even with neither set, see Input.", 'false'),
  ],
  code: `<AvatarUpload
  label="Profile photo"
  name={data.name}
  value={data.photo}
  onChange={(f) => setData({ ...data, photo: f })}
/>`,
  examples: [
    {
      id: 'basic',
      title: 'Basic',
      description:
        'The edit (pencil) button opens a menu: **Upload a photo** (library), **Take a photo** (a live camera capture via `getUserMedia`, falling back to a message if the camera is blocked), and **Remove** once a photo is set. Both routes end in a circular crop: drag to frame, scroll or the slider to zoom, **Save** exports. A shot taken from the camera also gets **Retake**, back to the live camera without going through the menu again; a library pick does not (choosing another file is already one click away). All strings are English by default; override with the `labels` prop.',
      code: `<AvatarUpload name="Ana Beatriz Ramos" value={photo} onChange={setPhoto} />`,
    },
    {
      id: 'existing',
      title: 'With a photo',
      description: 'Pass an existing URL string as `value`; it shows straight away, no crop. The menu then offers Replace / Remove.',
      code: `<AvatarUpload name="Marcos Lima" value="/img/marcos.jpg" onChange={setPhoto} />`,
    },
    {
      id: 'sizes',
      title: 'Sizes',
      description: '`size` sets the disc; the button and initials scale with it.',
      code: `<AvatarUpload name="AB" size={64} />
<AvatarUpload name="AB" size={96} />
<AvatarUpload name="AB" size={128} />`,
    },
    {
      id: 'disabled',
      title: 'Disabled',
      description: 'No edit button, no menu: an existing `value` still shows as a static disc.',
      code: `<AvatarUpload name="Ana" value="/img/ana.jpg" disabled />`,
    },
  ],
  guidelines: {
    do: [
      'Use for one person’s photo: profiles, team members, account settings.',
      'Let the crop do the framing; store the returned `File` and upload it server-side.',
      'Keep `hint` short: the affordance (the pencil button) speaks for itself.',
    ],
    dont: [
      'Documents / attachments / multiple files; that is `FileUpload`.',
      'Expecting HEIC to work: no browser but Safari decodes it; convert server-side. HEIC picks are rejected with a message.',
      'Skipping the server round-trip: `onChange` only gives you the cropped `File`.',
    ],
  },
};
