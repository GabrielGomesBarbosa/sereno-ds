/**
 * Matching for the docs sidebar search. Pure on purpose: the sidebar only
 * decides what to render from these results.
 */

/**
 * Lowercase and drop everything that is not a letter or a digit, so "date time",
 * "date-time" and "DateTime" are the same query for `DateTimePicker`.
 */
const squash = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * How well `query` matches any of the `labels`: `0` exact, `1` starts with,
 * `2` contains, `null` no match. An empty query matches everything (rank `0`),
 * which is the "no filter" state.
 */
export function matchRank(query: string, ...labels: string[]): number | null {
  const wanted = squash(query);
  if (!wanted) return 0;
  let best: number | null = null;
  for (const label of labels) {
    const candidate = squash(label);
    const rank = candidate === wanted ? 0 : candidate.startsWith(wanted) ? 1 : candidate.includes(wanted) ? 2 : null;
    if (rank !== null && (best === null || rank < best)) best = rank;
  }
  return best;
}
