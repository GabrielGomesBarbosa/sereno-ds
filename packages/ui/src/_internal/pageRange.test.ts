import { describe, expect, it } from 'vitest';
import { getPageItems, type PageItem } from './pageRange';

/** Compact, readable form: `1 2 3 4 5 … 20`. */
const show = (items: PageItem[]) => items.map((i) => (typeof i === 'number' ? String(i) : '…')).join(' ');

describe('getPageItems, exact shapes', () => {
  it.each([
    [1, 20, '1 2 3 4 5 … 20'],
    [3, 20, '1 2 3 4 5 … 20'],
    [4, 20, '1 2 3 4 5 … 20'], // the gap before the window is only page 2, so page 2 is shown
    [5, 20, '1 … 4 5 6 … 20'],
    [10, 20, '1 … 9 10 11 … 20'],
    [17, 20, '1 … 16 17 18 19 20'],
    [18, 20, '1 … 16 17 18 19 20'],
    [20, 20, '1 … 16 17 18 19 20'],
  ])('page %i of %i shows %s', (page, count, expected) => {
    expect(show(getPageItems(page, count))).toBe(expected);
  });

  it('shows every page when they all fit', () => {
    expect(show(getPageItems(1, 1))).toBe('1');
    expect(show(getPageItems(2, 5))).toBe('1 2 3 4 5');
    expect(show(getPageItems(4, 7))).toBe('1 2 3 4 5 6 7');
  });

  it('shows the lone page in a one-page gap instead of an ellipsis (an ellipsis would be no shorter)', () => {
    // 1 [2] 3 4 5 … : the gap before the window is only page 2.
    expect(show(getPageItems(4, 8))).toBe('1 2 3 4 5 … 8');
    expect(show(getPageItems(5, 8))).toBe('1 … 4 5 6 7 8');
  });

  it('honours siblingCount and boundaryCount', () => {
    expect(show(getPageItems(10, 20, 2, 1))).toBe('1 … 8 9 10 11 12 … 20');
    expect(show(getPageItems(10, 20, 1, 2))).toBe('1 2 … 9 10 11 … 19 20');
    expect(show(getPageItems(10, 20, 0, 1))).toBe('1 … 10 … 20');
    expect(show(getPageItems(10, 20, 1, 0))).toBe('… 9 10 11 …');
  });

  it('clamps an out-of-range page, and has nothing to show without pages', () => {
    expect(show(getPageItems(99, 20))).toBe(show(getPageItems(20, 20)));
    expect(show(getPageItems(0, 20))).toBe(show(getPageItems(1, 20)));
    expect(show(getPageItems(-4, 20))).toBe(show(getPageItems(1, 20)));
    expect(show(getPageItems(Number.NaN, 20))).toBe(show(getPageItems(1, 20)));
    expect(getPageItems(1, 0)).toEqual([]);
    expect(getPageItems(1, -3)).toEqual([]);
    expect(getPageItems(1, Number.NaN)).toEqual([]);
    expect(getPageItems(1, Number.POSITIVE_INFINITY)).toEqual([]);
  });
});

/**
 * The promises in the doc comment, checked over every page of every count up to 60 and a
 * spread of sibling / boundary counts, rather than a few hand-picked cases.
 */
describe('getPageItems, invariants (exhaustive)', () => {
  const combos: [number, number][] = [[0, 1], [1, 1], [2, 1], [1, 2], [2, 2], [1, 0]];
  for (const [siblings, boundary] of combos) {
    describe(`siblingCount ${siblings}, boundaryCount ${boundary}`, () => {
      const fullWidth = boundary * 2 + siblings * 2 + 3;

      it('numbers strictly increase, stay in range, and always include the current page', () => {
        for (let count = 1; count <= 60; count++) {
          for (let page = 1; page <= count; page++) {
            const nums = getPageItems(page, count, siblings, boundary).filter((i): i is number => typeof i === 'number');
            expect(nums.every((n) => n >= 1 && n <= count), `${page}/${count} in range`).toBe(true);
            expect(nums.every((n, i) => i === 0 || n > nums[i - 1]), `${page}/${count} increasing`).toBe(true);
            expect(nums, `${page}/${count} has current`).toContain(page);
          }
        }
      });

      it('an ellipsis hides two or more pages; without one, the neighbours are consecutive', () => {
        for (let count = 1; count <= 60; count++) {
          for (let page = 1; page <= count; page++) {
            const items = getPageItems(page, count, siblings, boundary);
            for (let i = 1; i < items.length; i++) {
              const prev = items[i - 1];
              const cur = items[i];
              if (typeof prev === 'number' && typeof cur === 'number') {
                expect(cur - prev, `${page}/${count} no ellipsis between ${prev} and ${cur}`).toBe(1);
              }
              if (typeof prev === 'number' && typeof cur !== 'number') {
                const next = items[i + 1];
                if (typeof next === 'number') expect(next - prev - 1, `${page}/${count} ellipsis hides 2+`).toBeGreaterThanOrEqual(2);
              }
            }
          }
        }
      });

      it('keeps the same length wherever the current page is (so the control does not change width)', () => {
        for (let count = fullWidth; count <= 60; count++) {
          const lengths = new Set<number>();
          for (let page = 1; page <= count; page++) lengths.add(getPageItems(page, count, siblings, boundary).length);
          expect([...lengths], `count ${count}`).toEqual([fullWidth]);
        }
      });

      it('shows every page when there are no more than the full width', () => {
        for (let count = 1; count < fullWidth; count++) {
          for (let page = 1; page <= count; page++) {
            expect(getPageItems(page, count, siblings, boundary), `${page}/${count}`).toEqual(Array.from({ length: count }, (_, i) => i + 1));
          }
        }
      });
    });
  }
});
