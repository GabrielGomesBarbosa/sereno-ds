import type { ComponentMeta } from '../catalog';
import { R } from './_shared';

export const brandMeta: ComponentMeta = {
  slug: 'brand',
  name: 'Brand',
  category: 'core',
  summary: 'The Sereno mark: an indigo water-drop symbol, optionally locked up with the `sereno` wordmark. Gradient is the brand indigo; the wordmark is `--font-display` at 500.',
  props: [
    R('variant', "'symbol' | 'lockup' | 'lockup-vertical'", 'Symbol only, or the symbol locked up with the wordmark (horizontal / stacked).', "'symbol'"),
    R('size', 'number', 'Symbol height in px. In the lockups it also drives the wordmark size.', '24'),
    R('mono', 'boolean', 'One-colour rendering (`currentColor`) instead of the gradient, favicons, print, tinted surfaces.', 'false'),
  ],
  code: `<Brand variant="lockup" size={28} />`,
  examples: [
    {
      id: 'variants',
      title: 'Variants',
      description: '`symbol` for tight spots (a favicon, an app tile); `lockup` in a header; `lockup-vertical` for a splash or a centred hero.',
      code: `<Brand variant="symbol" size={40} />
<Brand variant="lockup" size={28} />
<Brand variant="lockup-vertical" size={40} />`,
    },
    {
      id: 'mono',
      title: 'Monochrome',
      description: '`mono` drops the gradient and paints in `currentColor`, so it takes the text colour of wherever it sits. For favicons, print and tinted surfaces.',
      code: `<span style={{ color: 'var(--text-primary)' }}>
  <Brand variant="lockup" size={28} mono />
</span>`,
    },
    {
      id: 'sizes',
      title: 'Sizes',
      description: 'The symbol reads down to 16px; below that use the `mono` version so the gradient does not muddy. The wordmark tracks the symbol size in the lockups.',
      code: `<Brand variant="symbol" size={16} />
<Brand variant="symbol" size={24} />
<Brand variant="symbol" size={32} />
<Brand variant="symbol" size={48} />`,
    },
  ],
  guidelines: {
    do: ['Use the lockup where there is room for the wordmark; the symbol alone only in tight spots.', 'Switch to `mono` on tinted surfaces and below 16px.'],
    dont: ['Recolour the drop or add effects (shadow, gloss, outline).', 'Stretch or rotate the symbol, or set the wordmark in another font.'],
  },
};
