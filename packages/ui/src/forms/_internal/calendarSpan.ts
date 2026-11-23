import { parseISODate } from './calendarRange';

/**
 * What a range calendar (`DateRangePicker`) needs to draw: the stretch of days from one date to another, and what each
 * day is in it. Pure functions over ISO "YYYY-MM-DD" strings, which sort the same as the dates they name, so no `Date`
 * is built and a range across months or years needs no special case.
 */

/** The range a calendar is asked to draw. `{ start }` alone is a pick in progress: the first click has been made. */
export interface CalendarRangeValue {
  /** ISO "YYYY-MM-DD". `''` or a value that is not a date means none. */
  start?: string;
  /** ISO "YYYY-MM-DD". `''` or a value that is not a date means none. */
  end?: string;
}

/** The stretch to draw: `lo` and `hi` in order, whichever way the two ends were given. */
export interface DaySpan {
  lo: string;
  hi: string;
  /** The span is provisional: a pick in progress, grown to the day under the pointer or the keyboard cursor. */
  preview: boolean;
  /** The first click of a pick in progress (the only day that is picked so far). Set only when `preview`. */
  anchor?: string;
}

const valid = (iso: string | undefined): iso is string => !!parseISODate(iso);

/**
 * The span to draw for a range, or `null` when it holds nothing (no calendar marks). Both ends: that range, in order.
 * Only a start: a pick in progress, from the start to `previewIso` (the day under the pointer or the cursor), or just the
 * start while there is none.
 */
export function daySpan(range: CalendarRangeValue, previewIso?: string | null): DaySpan | null {
  const start = valid(range.start) ? range.start : null;
  const end = valid(range.end) ? range.end : null;
  if (start && end) return start <= end ? { lo: start, hi: end, preview: false } : { lo: end, hi: start, preview: false };
  if (!start) return null;
  const to = previewIso && valid(previewIso) ? previewIso : start;
  return { lo: to < start ? to : start, hi: to < start ? start : to, preview: true, anchor: start };
}

/** What a span says about one day. `edge` only exists when the span is more than one day: it is where the band stops. */
export interface DayInSpan {
  /** The day is an end of the span, or the anchor of a pick in progress: drawn like a picked day. */
  picked: boolean;
  /** `start` / `end` of a span of two days or more; a one-day span has no edge (nothing to connect to). */
  edge?: 'start' | 'end';
  /** A day strictly between the two ends. */
  inside: boolean;
  /** The day is on the stretch of a pick in progress (the provisional band). */
  preview: boolean;
  /** The far end of a pick in progress: where the pointer or the cursor is. Drawn as an end that is not committed yet. */
  previewEnd: boolean;
}

export function dayInSpan(iso: string, span: DaySpan | null): DayInSpan {
  const none: DayInSpan = { picked: false, inside: false, preview: false, previewEnd: false };
  if (!span || iso < span.lo || iso > span.hi) return none;
  const single = span.lo === span.hi;
  const isLo = iso === span.lo;
  const isHi = iso === span.hi;
  const picked = span.preview ? iso === span.anchor : isLo || isHi;
  return {
    picked,
    edge: single ? undefined : isLo ? 'start' : isHi ? 'end' : undefined,
    inside: !isLo && !isHi,
    preview: span.preview,
    previewEnd: span.preview && !single && !picked && (isLo || isHi),
  };
}
