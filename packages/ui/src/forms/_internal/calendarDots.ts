import type { CSSProperties } from 'react';

/**
 * What the month calendar (`CalendarGrid`, so `DateTimePicker` and `DatePicker`) says about the
 * day it is drawing, and the dots it can draw under a day by itself, as plain functions so
 * the two callers (the grid and `CalendarLegend`) cannot drift apart.
 */

/** The second argument of `renderDay`: the three things the calendar already knows about the day. */
export interface CalendarDayContext {
  /** The day is the selected one (what `aria-pressed` reports). It is painted with the primary color, so content under it must use `--interactive-primary-fg`. */
  selected: boolean;
  /** The day is today. */
  today: boolean;
  /** The day cannot be picked: it is listed in `unavailable`, or falls outside `min` .. `max`. */
  unavailable: boolean;
}

/** `brand` is the primary color; the others are the status tones (`Badge`, `Alert`, `Toast`). */
export type CalendarDotTone = 'brand' | 'success' | 'warning' | 'error' | 'info';

export interface CalendarDayDot {
  /** Default `brand`. */
  tone?: CalendarDotTone;
  /** What a screen reader says for the dot, after the day number. Default: the locale's "marked". */
  label?: string;
}

/**
 * The days that get a dot under their number: a list of day numbers, or an object keyed by day
 * number when a dot needs its own `tone` or `label`. Day numbers of the month on screen, the same
 * convention as `unavailable`.
 */
export type CalendarDayDots = number[] | Record<number, CalendarDayDot>;

export const DOT_SIZE = 6;

/**
 * The thin ring around today, drawn inside the cell. `--border-brand` rather than a neutral
 * border: it is 3.17:1 on the card in the light theme (3.47:1 in the dark one), where
 * `--border-strong` is 1.63:1 and would barely show. The calendar and `CalendarLegend` use this one value.
 */
export const TODAY_RING = 'inset 0 0 0 1px var(--border-brand)';

const TONE_VAR: Record<CalendarDotTone, string> = {
  brand: '--interactive-primary',
  success: '--status-success-dot',
  warning: '--status-warning-dot',
  error: '--status-error-dot',
  info: '--status-info-dot',
};

/** The dot of `day`, or `null` when it has none. A day listed without details gets the defaults. */
export function dotFor(dots: CalendarDayDots | undefined, day: number): CalendarDayDot | null {
  if (!dots) return null;
  if (Array.isArray(dots)) return dots.includes(day) ? {} : null;
  return Object.prototype.hasOwnProperty.call(dots, day) ? (dots[day] ?? {}) : null;
}

/**
 * The look of one dot. On the selected day the calendar paints the cell with the primary
 * color, so the dot turns to the color made for text on it (`--interactive-primary-fg`)
 * whatever its tone, or it would vanish into the fill. On a day that cannot be picked it
 * fades with the day number.
 */
export function dotStyle(tone: CalendarDotTone = 'brand', state: { selected?: boolean; unavailable?: boolean } = {}): CSSProperties {
  return {
    display: 'block',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: 'var(--radius-pill)',
    flex: '0 0 auto',
    background: state.selected ? 'var(--interactive-primary-fg)' : 'var(' + TONE_VAR[tone] + ')',
    opacity: !state.selected && state.unavailable ? 0.45 : 1,
  };
}
