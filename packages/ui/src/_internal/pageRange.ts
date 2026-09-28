export type PageItem = number | 'start-ellipsis' | 'end-ellipsis';

const range = (from: number, to: number): number[] => Array.from({ length: Math.max(to - from + 1, 0) }, (_, i) => from + i);

/**
 * Which page numbers `Pagination` shows, with an ellipsis where a run is folded away.
 *
 * `boundaryCount` pages stay pinned at each end and `siblingCount` pages flank the
 * current one. The list keeps the **same length** wherever the current page is (until
 * there are few enough pages to show them all), so the control doesn't change width as
 * you page through, and an ellipsis only ever stands for two or more hidden pages: a
 * gap of exactly one page shows that page's number instead, since "…" would be no
 * shorter.
 *
 * ```
 * getPageItems(1, 20)   // 1 2 3 4 5 … 20
 * getPageItems(10, 20)  // 1 … 9 10 11 … 20
 * getPageItems(20, 20)  // 1 … 16 17 18 19 20
 * ```
 *
 * Pure and framework-free, so it's unit-testable on its own. `page` is 1-based and
 * clamped into range; a `pageCount` under 1 has nothing to show.
 */
export function getPageItems(page: number, pageCount: number, siblingCount = 1, boundaryCount = 1): PageItem[] {
  // NaN / Infinity (say `Math.ceil(0 / 0)` from a zero page size) count as "no pages".
  const count = Number.isFinite(pageCount) ? Math.max(0, Math.floor(pageCount)) : 0;
  if (count === 0) return [];
  const current = Math.min(Math.max(Math.floor(page) || 1, 1), count);
  const siblings = Math.max(0, Math.floor(siblingCount));
  const boundary = Math.max(0, Math.floor(boundaryCount));

  const startPages = range(1, Math.min(boundary, count));
  const endPages = range(Math.max(count - boundary + 1, boundary + 1), count);

  // The window around the current page, pushed inward so it never overlaps the pinned
  // ends and never leaves a one-page gap next to them.
  const siblingsStart = Math.max(Math.min(current - siblings, count - boundary - siblings * 2 - 1), boundary + 2);
  const siblingsEnd = Math.min(
    Math.max(current + siblings, boundary + siblings * 2 + 2),
    endPages.length > 0 ? endPages[0] - 2 : count - 1,
  );

  return [
    ...startPages,
    // Before the window: an ellipsis if 2+ pages are folded away, else the lone page in the gap.
    ...(siblingsStart > boundary + 2 ? (['start-ellipsis'] as const) : boundary + 1 < count - boundary ? [boundary + 1] : []),
    ...range(siblingsStart, siblingsEnd),
    ...(siblingsEnd < count - boundary - 1 ? (['end-ellipsis'] as const) : count - boundary > boundary ? [count - boundary] : []),
    ...endPages,
  ];
}
