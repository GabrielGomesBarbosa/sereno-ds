import type { ComponentMeta } from '../catalog';
import { R } from './_shared';

export const fileUploadMeta: ComponentMeta = {
  slug: 'file-upload',
  name: 'FileUpload',
  category: 'forms',
  summary: 'Pick one file (click, keyboard or drag-and-drop) with a local preview. No upload happens here; `onChange` hands you the `File`.',
  props: [
    R('multiple', 'boolean', 'A list instead of one file. Flips `value` to `File[]` and `onChange` to `(files: File[]) => void`.', 'false'),
    R('value', 'File | string | null  ·  File[]', 'Single: the picked file or an existing URL. Multiple: the file list. Omit for uncontrolled.'),
    R('onChange', '(file: File | null) => void  ·  (files: File[]) => void', 'The chosen file(s). Signature follows `multiple`.'),
    R('accept', 'string', '`accept` attribute: also enforced on drop.', "'image/*'"),
    R('maxSizeMB', 'number', 'Files above this are rejected with a message.', '5'),
    R('shape', "'circle' | 'square'", 'Thumbnail shape for image previews: `circle` for avatars (single only).', "'square'"),
    R('prompt', 'string', 'Text inside the empty drop area.'),
    R('label / hint / error / required / disabled', '-', 'Same label contract as Input. The `aria-invalid` / `aria-describedby` wiring is on the drop zone (and on Replace once a file is chosen), since the file input itself is hidden. A single rejected file counts as an error; the "skipped N" note of `multiple` does not. With a `label`, the drop zone is named by it followed by the prompt ("Document Drag a file here, or click to choose"), since the label cannot reach the hidden input. `required` draws the asterisk only: the zone is a button, which cannot carry `aria-required`.'),
    R('preserveHelperSpace', 'boolean', "Reserve the hint/error row's height even with neither set, see Input.", 'false'),
  ],
  code: `<FileUpload
  label="Profile photo"
  hint="PNG or JPG, up to 5 MB."
  shape="circle"
  value={photo}
  onChange={setPhoto}
/>`,
  examples: [
    {
      id: 'basic',
      title: 'Basic',
      description: 'Empty state is a dashed drop area, click, `Enter` / `Space`, or drop a file on it. Once a file is set it swaps to a preview with **Replace** and **Remove**. `hint` carries the accepted types / size.',
      code: `<FileUpload
  label="Attachment"
  hint="PDF or image, up to 5 MB."
  accept="image/*,.pdf"
  value={file}
  onChange={setFile}
/>`,
    },
    {
      id: 'avatar',
      title: 'Circle thumbnail',
      description: '`shape="circle"` rounds the preview: a logo or a round-cropped asset where you do not need a crop step. For a person’s photo use `AvatarUpload` instead (pencil button + circular crop).',
      code: `<FileUpload label="Logo" hint="Square PNG, transparent background." shape="circle" value={logo} onChange={setLogo} />`,
    },
    {
      id: 'multiple',
      title: 'Multiple files',
      description: '`multiple` keeps the drop zone visible and stacks the picked files below, each with its own Remove. `value` is `File[]`, `onChange` gets the whole list. Files failing `accept` / `maxSizeMB` are skipped with a count.',
      code: `<FileUpload
  label="Portfolio"
  hint="Up to 5 MB each."
  multiple
  accept="image/*"
  value={files}
  onChange={setFiles}
/>`,
    },
    {
      id: 'error',
      title: 'Rejected file',
      description: 'A file outside `accept`, or over `maxSizeMB`, is refused with a message in the `error` slot, the field itself keeps its last valid value. You can also drive `error` yourself.',
      code: `<FileUpload label="Logo" accept="image/png" maxSizeMB={1} onChange={setLogo} />
// drop a 4 MB JPG -> "File is too large, keep it under 1 MB."`,
    },
    {
      id: 'disabled',
      title: 'Disabled',
      description: 'No picker, no drop, no Replace / Remove, an existing `value` still shows as a static preview.',
      code: `<FileUpload label="Profile photo" shape="circle" value="/img/ana.jpg" disabled />`,
    },
  ],
  guidelines: {
    do: [
      'Put the accepted types and the size limit in `hint`.',
      '`multiple` for a gallery / attachment list; single (default) for one document.',
    ],
    dont: [
      'Expecting it to upload; it only hands you the `File`(s); the screen does the request.',
      'A profile photo; that is `AvatarUpload` (pencil button + circular crop).',
    ],
  },
};
