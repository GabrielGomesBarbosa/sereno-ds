import type { CSSProperties } from 'react';

/**
 * Visually hidden, still read by a screen reader. For text that names something the eye gets
 * from a shape or a color (the dot under a calendar day). It is taken out of the flow and
 * clipped to a 1px box where it stands, so it adds nothing to the layout.
 */
export const srOnlyStyle: CSSProperties = {
  // Block, so it reads as its own word next to the visible text instead of running into it.
  display: 'block',
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
};
