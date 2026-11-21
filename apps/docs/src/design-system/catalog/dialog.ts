import type { ComponentMeta } from '../catalog';
import { R } from './_shared';

export const dialogMeta: ComponentMeta = {
  slug: 'dialog',
  name: 'Dialog',
  category: 'feedback',
  summary:
    'Modal (desktop), bottom sheet (mobile) or full-screen, a **compound component**. Portalled to `<body>` and fixed to the viewport; while open it locks page scroll and closes on Escape. Needs the sereno-pop / sereno-slide-up keyframes on the host.',
  props: [
    R('open', 'boolean', 'Controls visibility.', 'true'),
    R('onClose', '() => void', 'Called on scrim click, on Escape, and by `Dialog.Close`.'),
    R('variant', "'center' | 'sheet' | 'fullscreen'", 'sheet slides up from the bottom (mobile default); fullscreen fills the viewport.', "'center'"),
    R('size', "'sm' | 'md' | 'lg' | 'xl'", 'Max width of the centered modal (440 / 600 / 800 / 1000).', "'sm'"),
    R('dividers', 'boolean', 'Hairline rules between header / body / footer; the body scrolls on its own.', 'false'),
    R('dismissible', 'boolean', 'When false, a scrim click and Escape no longer close it, only `Dialog.Close`, a footer action, or open={false}.', 'true'),
    R('width', 'number', 'Explicit pixel width: overrides size.'),
    R('Dialog.Header · title / description', 'string', 'Both optional. Put `Dialog.Close` here too, if you want one.'),
    R('Dialog.Body', 'React.ReactNode', 'The scrolling content area. Optional: a header + footer alone is a valid dialog.'),
    R('Dialog.Footer', 'React.ReactNode', 'Action buttons, right-aligned.'),
    R('Dialog.Footer · fill', 'boolean', 'The buttons share the row and grow to fill it, and each line if they wrap, instead of hugging the right edge. For three actions or long translated labels, where a plain wrap would leave the last button alone, small and pushed right on a second line.', 'false'),
    R('Dialog.Close', '-', 'A ✕ button that calls the root’s `onClose`. Nothing renders one unless you add it, no more auto-default for `fullscreen`.'),
  ],
  code: `<Dialog open={open} onClose={() => setOpen(false)}>
  <Dialog.Header title="Cancel booking?" description="A cliente será avisada por WhatsApp." />
  <Dialog.Footer>
    <Button variant="ghost" onClick={() => setOpen(false)}>Back</Button>
    <Button variant="error">Cancel booking</Button>
  </Dialog.Footer>
</Dialog>`,
  examples: [
    {
      id: 'center',
      title: 'Center (desktop)',
      description: 'The desktop default. `Dialog.Footer` holds the buttons, right-aligned. For destructive actions, the title **names the consequence** before it asks.',
      code: `<Dialog open={open} onClose={() => setOpen(false)}>
  <Dialog.Header title="Cancel booking?" description="The client will be notified via WhatsApp and the slot frees up." />
  <Dialog.Footer>
    <Button variant="ghost" onClick={() => setOpen(false)}>Back</Button>
    <Button variant="error">Cancel booking</Button>
  </Dialog.Footer>
</Dialog>`,
    },
    {
      id: 'sheet',
      title: 'Sheet (mobile)',
      description: '`variant="sheet"` slides up from the bottom of the screen, with a grabber at the top. It is the mobile default.',
      code: `<Dialog variant="sheet" open={open} onClose={close}>
  <Dialog.Header title="Filters" />
  <Dialog.Body>{/* content */}</Dialog.Body>
  <Dialog.Footer>{footer}</Dialog.Footer>
</Dialog>`,
    },
    {
      id: 'sizes',
      title: 'Sizes',
      description: '`size` caps the centered modal at a fixed max-width, `sm` (440), `md` (600), `lg` (800), `xl` (1000). It still shrinks to fit narrow screens. `width` takes an explicit pixel value instead.',
      code: `<Dialog size="lg" open={open} onClose={close}>
  <Dialog.Header title="Report" />
  <Dialog.Body>{/* wide content */}</Dialog.Body>
</Dialog>`,
    },
    {
      id: 'dividers',
      title: 'Dividers',
      description: 'Set `dividers` for a hairline rule under the header and above the footer; the body then scrolls between them so the title and actions stay put. Add a `Dialog.Close` inside `Dialog.Header` for a ✕.',
      code: `<Dialog dividers open={open} onClose={close}>
  <Dialog.Header title="Terms of service"><Dialog.Close /></Dialog.Header>
  <Dialog.Body>{/* long, scrolling content */}</Dialog.Body>
  <Dialog.Footer>{footer}</Dialog.Footer>
</Dialog>`,
    },
    {
      id: 'form',
      title: 'Form inside',
      description: 'Inputs, selects and checkboxes sit inside a `Dialog.Body` without ceremony. Keep the form short enough not to need `dividers`, a `Select` menu opens within the panel, so a scrolling body would clip it.',
      code: `<Dialog size="md" open={open} onClose={close}>
  <Dialog.Header title="New booking"><Dialog.Close /></Dialog.Header>
  <Dialog.Body>
    <Input label="Client" />
    <Select label="Service" options={services} />
  </Dialog.Body>
  <Dialog.Footer>{footer}</Dialog.Footer>
</Dialog>`,
    },
    {
      id: 'fullscreen',
      title: 'Full screen',
      description: '`variant="fullscreen"` fills the viewport (no radius, no scrim gap), for immersive multi-section flows. Add a `Dialog.Close` yourself; nothing shows one automatically.',
      code: `<Dialog variant="fullscreen" dividers open={open} onClose={close}>
  <Dialog.Header title="Edit availability"><Dialog.Close /></Dialog.Header>
  <Dialog.Body>{/* full-page form */}</Dialog.Body>
  <Dialog.Footer>{footer}</Dialog.Footer>
</Dialog>`,
    },
    {
      id: 'dismissible',
      title: 'Require a choice',
      description: '`dismissible={false}` drops the scrim-click and Escape shortcuts, so the user has to pick a footer action (or a `Dialog.Close`, if you added one). Reserve it for a decision that really can’t be deferred, a stray click shouldn’t trap people.',
      code: `<Dialog dismissible={false} open={open} onClose={close}>
  <Dialog.Header title="Discard 3 unsaved changes?" description="…" />
  <Dialog.Footer>{footer}</Dialog.Footer>
</Dialog>`,
    },
  ],
  guidelines: {
    do: [
      'A title that names the consequence in destructive actions.',
      '`sheet` on mobile, `center` on desktop; `fullscreen` for long multi-step flows.',
      '`dividers` whenever the body can scroll.',
      'The destructive action on the right of the `footer`.',
      '`dismissible={false}` only for a genuinely blocking choice, and always leave a visible way out (a ✕ or a footer button).',
    ],
    dont: ['"Tem certeza?" as the title.', 'A `Dialog` for information that would fit in an in-page `Alert`.', 'A tall form with no `dividers`: the header scrolls away with it.', '`dismissible={false}` as a default: most dialogs should let a scrim click out.'],
  },
};
