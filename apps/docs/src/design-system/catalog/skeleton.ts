import type { ComponentMeta } from '../catalog';
import { R } from './_shared';

export const skeletonMeta: ComponentMeta = {
  slug: 'skeleton',
  name: 'Skeleton',
  category: 'feedback',
  summary: 'Loading placeholder that holds the shape of content still being fetched. Needs the sereno-pulse keyframes on the host.',
  props: [
    R('variant', "'text' | 'card' | 'avatar' | 'block'", 'text = stacked lines. card = avatar + 3 lines + pill. avatar = circle. block = rectangle.', "'text'"),
    R('lines', 'number', 'Line count for variant="text".', '3'),
    R('width / height', 'number | string', 'Overrides the per-variant default size.'),
  ],
  code: `<Skeleton variant="card" />`,
  examples: [
    {
      id: 'variants',
      title: 'Variants',
      description: '`text` = stacked lines (last one shorter). `card` = avatar + 3 lines + pill (a typical list-row card). `avatar` = circle. `block` = a rectangle for an image/chart/calendar.',
      code: `<Skeleton variant="text" />
<Skeleton variant="card" />
<Skeleton variant="avatar" />
<Skeleton variant="block" height={80} />`,
    },
    {
      id: 'lines',
      title: 'Lines and size',
      description: '`lines` controls the count in `variant="text"`; `width`/`height` override the per-variant default.',
      code: `<Skeleton variant="text" lines={2} />
<Skeleton variant="block" width={220} height={64} />`,
    },
  ],
  guidelines: {
    do: ['Use `card` for lists that load from the network (agenda, catalogue).', 'Same shape/height as the real content: the screen must not "jump" when it loads.'],
    dont: ['A skeleton for more than ~2s with no other signal, consider an error state.'],
  },
};
