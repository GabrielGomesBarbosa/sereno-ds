'use client';

import * as React from 'react';
import { sx } from '../_internal/style';
import { Typography } from '../core/Typography';
import { dotStyle, TODAY_RING, type CalendarDotTone } from './_internal/calendarDots';

export interface CalendarLegendItem {
  label: string;
  /**
   * The filled dot the calendar draws under a day (`dayDots`). `true` is the primary color; a
   * tone picks the status color the same way `dayDots` does.
   */
  dot?: boolean | CalendarDotTone;
  /** The thin ring the calendar draws around today. Together with `dot`, the dot sits inside the ring. */
  outline?: boolean;
}

export interface CalendarLegendProps extends Omit<React.HTMLAttributes<HTMLUListElement>, 'children'> {
  /** One entry per thing the calendar marks. An item with neither `dot` nor `outline` is just its label. */
  items: CalendarLegendItem[];
}

const RING = 12;

function Swatch({ dot, outline }: Pick<CalendarLegendItem, 'dot' | 'outline'>) {
  const tone: CalendarDotTone = typeof dot === 'string' ? dot : 'brand';
  const dotEl = dot ? <span style={dotStyle(tone)} /> : null;
  if (!outline) return dotEl;
  return (
    <span
      style={sx({
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: RING,
        height: RING,
        flex: '0 0 auto',
        borderRadius: 'var(--radius-xs)',
        boxShadow: TODAY_RING,
      })}
    >
      {dotEl}
    </span>
  );
}

/**
 * The footer that explains what a calendar marks (`dayDots`, today's ring), so the screens that
 * show one explain it the same way. Draws the same dot and ring the calendar does, from the
 * same functions. Put it right under the `DateTimePicker`; it wraps on a narrow screen.
 */
export function CalendarLegend({ items, style, ...rest }: CalendarLegendProps) {
  return (
    <ul
      // `list-style: none` makes Safari drop the list semantics; the role keeps them.
      role="list"
      {...rest}
      style={sx({
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-1) var(--space-4)',
        listStyle: 'none',
        margin: 0,
        padding: 'var(--space-1) var(--space-2)',
        ...style,
      })}
    >
      {items.map((item, i) => (
        <li key={i} style={sx({ display: 'inline-flex', alignItems: 'center', gap: 6 })}>
          {item.dot || item.outline ? (
            <span aria-hidden style={sx({ display: 'inline-flex' })}>
              <Swatch dot={item.dot} outline={item.outline} />
            </span>
          ) : null}
          <Typography as="span" variant="caption" color="secondary">
            {item.label}
          </Typography>
        </li>
      ))}
    </ul>
  );
}

CalendarLegend.displayName = 'CalendarLegend';
