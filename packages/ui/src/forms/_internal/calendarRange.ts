/**
 * The `min` / `max` limits of the month calendar (`CalendarGrid`, so `DateTimePicker` and
 * `DatePicker`), as pure functions. A month is one integer, `year * 12 + month` (month
 * 0-indexed), the same one `CalendarGrid` keeps for its visible month, so stepping and
 * clamping is plain arithmetic with no `Date` juggling across year ends.
 */

export interface YMD {
  year: number;
  /** 0-indexed, like `Date`. */
  month: number;
  day: number;
}

/** "YYYY-MM-DD" to its parts, or `null` for anything else (a bad bound is ignored, not guessed at). */
export function parseISODate(iso: string | undefined): YMD | null {
  if (!iso) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  return { year: Number(m[1]), month: Number(m[2]) - 1, day: Number(m[3]) };
}

export function toISODate(year: number, month: number, day: number): string {
  return `${String(year).padStart(4, '0')}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export interface CalendarRange {
  min: YMD | null;
  max: YMD | null;
  /** The first / last visible month, as `year * 12 + month`. `-Infinity` / `Infinity` when unbounded. */
  minIndex: number;
  maxIndex: number;
  /** The first / last year with any valid month. `-Infinity` / `Infinity` when unbounded. */
  minYear: number;
  maxYear: number;
}

export function calendarRange(min?: string, max?: string): CalendarRange {
  const lo = parseISODate(min);
  const hi = parseISODate(max);
  return {
    min: lo,
    max: hi,
    minIndex: lo ? lo.year * 12 + lo.month : -Infinity,
    maxIndex: hi ? hi.year * 12 + hi.month : Infinity,
    minYear: lo ? lo.year : -Infinity,
    maxYear: hi ? hi.year : Infinity,
  };
}

/**
 * The nearest visible month inside the range. `min` wins if the two cross (a range with
 * `min` after `max` has no valid month at all, so there is nothing better to show).
 */
export function clampIndex(index: number, range: CalendarRange): number {
  return Math.max(range.minIndex, Math.min(range.maxIndex, index));
}

/** Whether `day` of the month `index` falls before `min` or after `max`. */
export function isDayOutside(range: CalendarRange, index: number, day: number): boolean {
  // A day is at most 31, so `index * 32 + day` orders dates the same way the calendar does.
  const key = index * 32 + day;
  if (range.min && key < range.minIndex * 32 + range.min.day) return true;
  if (range.max && key > range.maxIndex * 32 + range.max.day) return true;
  return false;
}

/**
 * First year of the 12-year block the year picker opens on: the visible year with 5 before it,
 * pulled back inside the range when it can be, so the block is not mostly years that cannot be
 * picked. Unbounded, it is exactly `viewYear - 5`, as it always was.
 */
export function yearWindowStart(viewYear: number, range: CalendarRange): number {
  let base = viewYear - 5;
  if (Number.isFinite(range.maxYear)) base = Math.min(base, range.maxYear - 11);
  if (Number.isFinite(range.minYear)) base = Math.max(base, range.minYear);
  return base;
}
