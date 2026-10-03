import { describe, expect, it } from 'vitest';
import { calendarRange, clampIndex, isDayOutside, parseISODate, toISODate, yearWindowStart } from './calendarRange';

const idx = (year: number, month: number) => year * 12 + month; // month 0-indexed

describe('parseISODate / toISODate', () => {
  it('reads "YYYY-MM-DD" with a 0-indexed month, and writes it back', () => {
    expect(parseISODate('2026-10-05')).toEqual({ year: 2026, month: 9, day: 5 });
    expect(toISODate(2026, 9, 5)).toBe('2026-10-05');
    expect(toISODate(7, 0, 1)).toBe('0007-01-01');
  });

  it('anything that is not exactly that is no date, so a bad bound is ignored', () => {
    for (const bad of [undefined, '', '2026-10', '2026-1-5', '5/10/2026', '2026-10-05T00:00', 'tomorrow']) {
      expect(parseISODate(bad as string | undefined)).toBeNull();
    }
  });
});

describe('calendarRange', () => {
  it('no bounds: everything is infinite, and nothing is outside', () => {
    const r = calendarRange();
    expect([r.minIndex, r.maxIndex, r.minYear, r.maxYear]).toEqual([-Infinity, Infinity, -Infinity, Infinity]);
    expect(isDayOutside(r, idx(1999, 0), 1)).toBe(false);
    expect(clampIndex(idx(2026, 9), r)).toBe(idx(2026, 9));
  });

  it('turns min and max into month indexes and years', () => {
    const r = calendarRange('2026-10-05', '2027-02-20');
    expect(r.minIndex).toBe(idx(2026, 9));
    expect(r.maxIndex).toBe(idx(2027, 1));
    expect([r.minYear, r.maxYear]).toEqual([2026, 2027]);
  });

  it('an invalid bound leaves that side open', () => {
    const r = calendarRange('nope', '2027-02-20');
    expect(r.minIndex).toBe(-Infinity);
    expect(r.maxIndex).toBe(idx(2027, 1));
  });
});

describe('clampIndex', () => {
  const r = calendarRange('2026-10-05', '2027-02-20');
  it('keeps a month inside, moves one outside to the nearest edge', () => {
    expect(clampIndex(idx(2026, 11), r)).toBe(idx(2026, 11));
    expect(clampIndex(idx(2025, 0), r)).toBe(idx(2026, 9));
    expect(clampIndex(idx(2030, 5), r)).toBe(idx(2027, 1));
  });

  it('works across a year end, where month arithmetic usually goes wrong', () => {
    expect(clampIndex(idx(2026, 9) - 1, r)).toBe(idx(2026, 9)); // September 2026 -> October
    expect(clampIndex(idx(2027, 1) + 1, r)).toBe(idx(2027, 1)); // March 2027 -> February
  });

  it('with min after max, min wins and nothing loops', () => {
    const inverted = calendarRange('2026-12-01', '2026-02-01');
    expect(clampIndex(idx(2026, 9), inverted)).toBe(idx(2026, 11));
    expect(clampIndex(idx(2026, 11), inverted)).toBe(idx(2026, 11));
  });
});

describe('isDayOutside', () => {
  const r = calendarRange('2026-10-05', '2026-12-20');
  it('the min and max days themselves are inside, the day before / after is not', () => {
    expect(isDayOutside(r, idx(2026, 9), 4)).toBe(true);
    expect(isDayOutside(r, idx(2026, 9), 5)).toBe(false);
    expect(isDayOutside(r, idx(2026, 11), 20)).toBe(false);
    expect(isDayOutside(r, idx(2026, 11), 21)).toBe(true);
  });

  it('every day of a month between them is inside, and of any month outside is not', () => {
    expect(isDayOutside(r, idx(2026, 10), 1)).toBe(false);
    expect(isDayOutside(r, idx(2026, 10), 31)).toBe(false);
    expect(isDayOutside(r, idx(2026, 8), 30)).toBe(true);
    expect(isDayOutside(r, idx(2027, 0), 1)).toBe(true);
  });

  it('a one-sided range only checks that side', () => {
    expect(isDayOutside(calendarRange('2026-10-05'), idx(2030, 0), 1)).toBe(false);
    expect(isDayOutside(calendarRange(undefined, '2026-10-05'), idx(2020, 0), 1)).toBe(false);
  });
});

describe('yearWindowStart', () => {
  it('unbounded it is the visible year minus 5, as it always was', () => {
    expect(yearWindowStart(2026, calendarRange())).toBe(2021);
  });

  it('min pulls the block forward, so it is not mostly years that cannot be picked', () => {
    expect(yearWindowStart(2026, calendarRange('2026-10-05'))).toBe(2026);
    expect(yearWindowStart(2026, calendarRange('2024-01-01'))).toBe(2024);
  });

  it('max pulls the block back', () => {
    expect(yearWindowStart(2026, calendarRange(undefined, '2028-01-01'))).toBe(2017);
  });

  it('with both, min wins when the range is shorter than a block', () => {
    expect(yearWindowStart(2026, calendarRange('2026-01-01', '2028-01-01'))).toBe(2026);
  });
});
