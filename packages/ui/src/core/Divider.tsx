'use client';

import * as React from 'react';
import { sx } from '../_internal/style';

/**
 * A horizontal line that separates two stretches of content. `default` is the subtle hairline of
 * a list or a card; `strong` is a firmer one for a page background, where the subtle one nearly
 * disappears.
 *
 * It has no margin of its own: the space around it is the caller's (a `gap` on the parent, or a
 * `style` on the divider).
 */
export interface DividerProps extends Omit<React.HTMLAttributes<HTMLHRElement>, 'children'> {
  /**
   * `strong` is `--border-strong`, firmer than the `--border-subtle` of `default`. Firmer, not
   * high contrast: it is 1.63:1 against a card and 1.38:1 against the page in the light theme
   * (1.83:1 and 2.03:1 in the dark one), which is right for a separator and short of what a
   * control's edge would need.
   */
  variant?: 'default' | 'strong';
  /**
   * Hides the line from a screen reader (`role="none"`). For lines between rows that repeat, so
   * the reader does not announce a separator after every one. Without it the line is a
   * separator, which is right between two sections.
   */
  decorative?: boolean;
}

const COLOR = { default: '--border-subtle', strong: '--border-strong' } as const;

export function Divider({ variant = 'default', decorative = false, style, ...rest }: DividerProps) {
  return (
    <hr
      role={decorative ? 'none' : undefined}
      {...rest}
      style={sx({
        // Longhands only (no `border` shorthand), so a later render never mixes the two.
        borderStyle: 'solid',
        borderColor: 'var(' + (COLOR[variant] || COLOR.default) + ')',
        borderWidth: 'var(--border-width-hairline) 0 0 0',
        height: 0,
        width: '100%',
        margin: 0,
        flex: '0 0 auto',
        ...style,
      })}
    />
  );
}
