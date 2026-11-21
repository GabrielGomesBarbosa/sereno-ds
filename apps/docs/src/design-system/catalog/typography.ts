import type { ComponentMeta } from '../catalog';
import { R } from './_shared';

export const typographyMeta: ComponentMeta = {
  slug: 'typography',
  name: 'Typography',
  category: 'core',
  summary: 'The type-scale/font-family/weight combos every screen otherwise reconstructs by hand, one component instead of a new style object each time.',
  props: [
    R(
      'variant',
      "'display' | 'h1' | 'h2' | 'h3' | 'body' | 'bodySm' | 'label' | 'caption' | 'eyebrow'",
      'Picks the look *and* the default semantic tag (`h1` → `<h1>`, `body` → `<p>`, `label`/`caption`/`eyebrow` → `<span>`).',
      "'body'",
    ),
    R(
      'color',
      "'primary' | 'secondary' | 'muted' | 'disabled' | 'inverse' | 'brand' | 'accent' | 'link' | 'error' | 'success' | 'inherit'",
      'Overrides the variant\'s own default (`bodySm` → secondary, `caption`/`eyebrow` → muted, the rest → primary). `success` is the text green (`--status-success-fg`), for a satisfied rule or a confirmed state: it keeps AA for small text on the surface, canvas and subtle backgrounds in both themes, but in the light theme it is 4.41:1 on `--bg-sunken`, just under, so do not put it there. `inherit` is not a token: the text takes its parent\'s color (text on a colored strip, say), so the parent is the one that has to keep the contrast.',
      'variant-dependent',
    ),
    R('as', 'React.ElementType', 'Render as a different tag without changing the variant\'s styling, a heading-styled label that should not enter the document outline.'),
    R('truncate', 'boolean', 'Single-line ellipsis. Needs a width-constrained ancestor to actually clip.', 'false'),
    R('numeric', 'boolean', 'Tabular (fixed-width) figures. For a value that updates or stacks with others at the same position: countdowns, ticket/queue numbers, times, prices.', 'false'),
  ],
  code: `<Typography variant="h2">Section title</Typography>
<Typography variant="bodySm">Supporting text.</Typography>`,
  examples: [
    {
      id: 'variants',
      title: 'Variants',
      description:
        'Every variant embeds `fontFamily` / `fontSize` / `fontWeight` / `letterSpacing` / `lineHeight` and its own default tag; this is the whole type scale, not a subset.',
      code: `<Typography variant="display">Display</Typography>
<Typography variant="h1">Heading 1</Typography>
<Typography variant="h2">Heading 2</Typography>
<Typography variant="h3">Heading 3</Typography>
<Typography variant="body">Body: the default paragraph text.</Typography>
<Typography variant="bodySm">Body small: secondary paragraph text.</Typography>
<Typography variant="label">Label</Typography>
<Typography variant="caption">Caption</Typography>
<Typography variant="eyebrow">Eyebrow</Typography>`,
    },
    {
      id: 'colors',
      title: 'Colors',
      description:
        '`color` overrides the variant\'s own default: every color is a text token, never a raw value. `success` is the green for a satisfied rule or a confirmed state, next to a green icon. `inherit` is the one that is not a token: the text takes its parent\'s color, here a strip whose own foreground it follows, so a class on a parent can set the color without an inline `style` to fight.',
      code: `<Typography variant="label" color="brand">Brand</Typography>
<Typography variant="label" color="accent">Accent</Typography>
<Typography variant="label" color="error">Error</Typography>
<Typography variant="label" color="success">Success</Typography>
<Typography variant="label" color="muted">Muted</Typography>

<div style={{ background: 'var(--interactive-primary)', color: 'var(--interactive-primary-fg)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)' }}>
  <Typography variant="label" color="inherit">Takes the strip's color</Typography>
</div>`,
    },
    {
      id: 'as',
      title: 'A different tag, the same look',
      description:
        '`as` swaps the rendered element without touching the variant\'s style, an `h3`-styled card title that is not actually a heading in the page outline, or an `h1`-styled `span` inline with other text.',
      code: `<Typography variant="h3" as="div">
  Looks like a heading, isn't one in the outline
</Typography>`,
    },
    {
      id: 'truncate',
      title: 'Truncate',
      description: '`truncate` clips to one line with an ellipsis. The parent needs a bounded width for it to actually clip.',
      code: `<div style={{ maxWidth: 220 }}>
  <Typography variant="label" truncate>
    A title long enough to need clipping in a narrow card
  </Typography>
</div>`,
    },
    {
      id: 'numeric',
      title: 'Numeric (tabular figures)',
      description:
        '`numeric` fixes every digit to the same width, so a value that changes in place, or several stacked at the same x-position, doesn\'t jiggle. Use it for countdowns, queue/ticket numbers, clocks, prices in a column.',
      code: `<Typography variant="display" numeric>A002</Typography>
<Typography variant="h1" color="brand" numeric>11:00</Typography>`,
    },
  ],
  guidelines: {
    do: [
      'Reach for a variant instead of retyping `fontFamily`/`fontSize`/`fontWeight` inline.',
      '`as` when the visual weight of a heading is right but the tag would break the document outline (e.g. two `h1`-styled titles on one page).',
      '`color` for state (an error message, a satisfied rule, a muted secondary line), never a raw color value.',
      '`color="success"` for a rule that is met or a state that is confirmed, next to a green icon, on the surface, canvas or subtle backgrounds.',
      '`color="inherit"` for text on a colored strip, or whose color is the parent\'s to set: let the strip hold its foreground and the text follow it.',
      '`numeric` on any figure that updates in place or lines up with others, a queue number, a countdown, a price column.',
    ],
    dont: [
      'A `variant` chosen for its color instead of its size/weight, use `color` for that axis, they\'re independent.',
      '`color="success"` on `--bg-sunken` in the light theme: 4.41:1, under AA for small text.',
      '`color="inherit"` inside a parent whose own color you have not checked against its background: the contrast is now the parent\'s.',
      'Wrapping every single span of text in `Typography`, plain inline text next to an icon, inside a `Badge`, etc. doesn\'t need it.',
    ],
  },
};
