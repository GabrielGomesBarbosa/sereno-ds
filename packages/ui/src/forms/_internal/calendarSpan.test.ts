import { describe, expect, it } from 'vitest';
import { dayInSpan, daySpan } from './calendarSpan';

describe('daySpan', () => {
  it('nothing given, or nothing valid: no span', () => {
    expect(daySpan({})).toBeNull();
    expect(daySpan({ start: '', end: '' })).toBeNull();
    expect(daySpan({ start: 'banana', end: '2026-10-12' })).toBeNull(); // an end without a valid start is not a pick
    expect(daySpan({ end: '2026-10-12' })).toBeNull();
  });

  it('both ends: that range, in order whichever way it was given', () => {
    expect(daySpan({ start: '2026-10-05', end: '2026-10-12' })).toEqual({ lo: '2026-10-05', hi: '2026-10-12', preview: false });
    expect(daySpan({ start: '2026-10-12', end: '2026-10-05' })).toEqual({ lo: '2026-10-05', hi: '2026-10-12', preview: false });
  });

  it('only a start is a pick in progress: just that day, or grown to the day under the pointer', () => {
    expect(daySpan({ start: '2026-10-05' })).toEqual({ lo: '2026-10-05', hi: '2026-10-05', preview: true, anchor: '2026-10-05' });
    expect(daySpan({ start: '2026-10-05' }, '2026-10-09')).toEqual({ lo: '2026-10-05', hi: '2026-10-09', preview: true, anchor: '2026-10-05' });
  });

  it('a pointer before the start grows the span backwards', () => {
    expect(daySpan({ start: '2026-10-05' }, '2026-10-01')).toEqual({ lo: '2026-10-01', hi: '2026-10-05', preview: true, anchor: '2026-10-05' });
  });

  it('a range across months and years needs nothing special: ISO dates sort like the dates', () => {
    const span = daySpan({ start: '2026-12-30', end: '2027-01-02' })!;
    expect(dayInSpan('2026-12-31', span).inside).toBe(true);
    expect(dayInSpan('2027-01-01', span).inside).toBe(true);
    expect(dayInSpan('2027-01-03', span).inside).toBe(false);
  });

  it('ignores a preview that is not a date', () => {
    expect(daySpan({ start: '2026-10-05' }, 'nope')).toEqual({ lo: '2026-10-05', hi: '2026-10-05', preview: true, anchor: '2026-10-05' });
  });
});

describe('dayInSpan', () => {
  const span = daySpan({ start: '2026-10-05', end: '2026-10-08' });

  it('no span, or a day outside it: nothing', () => {
    expect(dayInSpan('2026-10-05', null)).toEqual({ picked: false, inside: false, preview: false, previewEnd: false });
    expect(dayInSpan('2026-10-04', span)).toEqual({ picked: false, inside: false, preview: false, previewEnd: false });
    expect(dayInSpan('2026-10-09', span).picked).toBe(false);
  });

  it('the two ends are picked, with an edge; the days between are inside, with none', () => {
    expect(dayInSpan('2026-10-05', span)).toMatchObject({ picked: true, edge: 'start', inside: false, preview: false });
    expect(dayInSpan('2026-10-08', span)).toMatchObject({ picked: true, edge: 'end', inside: false });
    expect(dayInSpan('2026-10-06', span)).toMatchObject({ picked: false, edge: undefined, inside: true });
  });

  it('a one-day range: that day is picked, with no edge and nothing between', () => {
    const one = daySpan({ start: '2026-10-05', end: '2026-10-05' });
    expect(dayInSpan('2026-10-05', one)).toMatchObject({ picked: true, edge: undefined, inside: false });
  });

  it('a pick in progress: only the anchor is picked; the far end is a preview end, the days between are provisional', () => {
    const pending = daySpan({ start: '2026-10-05' }, '2026-10-08');
    expect(dayInSpan('2026-10-05', pending)).toMatchObject({ picked: true, edge: 'start', preview: true, previewEnd: false });
    expect(dayInSpan('2026-10-06', pending)).toMatchObject({ picked: false, inside: true, preview: true });
    expect(dayInSpan('2026-10-08', pending)).toMatchObject({ picked: false, edge: 'end', preview: true, previewEnd: true });
  });

  it('a pick in progress grown backwards keeps the anchor as the picked end', () => {
    const pending = daySpan({ start: '2026-10-05' }, '2026-10-02');
    expect(dayInSpan('2026-10-05', pending)).toMatchObject({ picked: true, edge: 'end' });
    expect(dayInSpan('2026-10-02', pending)).toMatchObject({ picked: false, edge: 'start', previewEnd: true });
  });

  it('a pick in progress with the pointer on the anchor is one day: no band, no preview end', () => {
    const pending = daySpan({ start: '2026-10-05' }, '2026-10-05');
    expect(dayInSpan('2026-10-05', pending)).toMatchObject({ picked: true, edge: undefined, previewEnd: false });
  });
});
