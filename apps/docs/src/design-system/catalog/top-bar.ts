import type { ComponentMeta } from '../catalog';
import { R } from './_shared';

export const topBarMeta: ComponentMeta = {
  slug: 'top-bar',
  name: 'TopBar',
  category: 'navigation',
  summary: 'Sticky page header: a **compound component**. `Leading` / `Title` / `Actions` are independent, optional slots. 60px, translucent with blur.',
  props: [
    R('sticky', 'boolean', 'Sticks to the top on scroll.', 'true'),
    R('transparent', 'boolean', 'Drops the blur/border for hero headers.', 'false'),
    R('TopBar.Leading', 'React.ReactNode', 'Usually a back `IconButton` or the wordmark. No wrapper of its own: renders exactly what you give it.'),
    R('TopBar.Title', 'React.ReactNode', 'The title text, as children.'),
    R('TopBar.Title · subtitle', 'React.ReactNode', 'A second line: plain string in most cases, or a node for e.g. a `<time>` element.'),
    R('TopBar.Actions', 'React.ReactNode', 'Trailing actions.'),
  ],
  code: `<TopBar>
  <TopBar.Leading><IconButton label="Back"><ChevronLeft size={18} /></IconButton></TopBar.Leading>
  <TopBar.Title subtitle="Therapy session">Pick a time</TopBar.Title>
</TopBar>`,
  examples: [
    {
      id: 'basic',
      title: 'Title and subtitle',
      description: '`Leading` is usually a back `IconButton`; `Actions` sit on the right.',
      code: `<TopBar>
  <TopBar.Leading><IconButton label="Back"><ChevronLeft size={18} /></IconButton></TopBar.Leading>
  <TopBar.Title>Your details</TopBar.Title>
</TopBar>`,
    },
    {
      id: 'full',
      title: 'With leading and actions',
      code: `<TopBar>
  <TopBar.Leading><IconButton label="Back"><ChevronLeft size={18} /></IconButton></TopBar.Leading>
  <TopBar.Title subtitle="Therapy session">Pick a time</TopBar.Title>
  <TopBar.Actions><IconButton label="Notifications"><Bell size={18} /></IconButton></TopBar.Actions>
</TopBar>`,
    },
    {
      id: 'transparent',
      title: 'Transparent',
      description: '`transparent` drops the blur and border: for hero headers over a coloured surface.',
      code: `<TopBar transparent>
  <TopBar.Leading><span className="wordmark">Sereno</span></TopBar.Leading>
</TopBar>`,
    },
  ],
  guidelines: {
    do: ['60px, `sticky` to the top by default.', '`Leading` = back or the wordmark; never both.'],
    dont: ['More than two `Actions`; that becomes a menu.'],
  },
};
