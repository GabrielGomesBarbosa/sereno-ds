import { describe, expect, it } from 'vitest';
import { dotFor, dotStyle, DOT_SIZE } from './calendarDots';

describe('dotFor', () => {
  it('nothing given: no dot on any day', () => {
    expect(dotFor(undefined, 5)).toBeNull();
    expect(dotFor([], 5)).toBeNull();
    expect(dotFor({}, 5)).toBeNull();
  });

  it('a list of days: a dot with the defaults on exactly those days', () => {
    expect(dotFor([3, 17], 3)).toEqual({});
    expect(dotFor([3, 17], 17)).toEqual({});
    expect(dotFor([3, 17], 4)).toBeNull();
  });

  it('an object keyed by day: the dot carries its own tone and label', () => {
    const dots = { 3: { tone: 'warning', label: 'Pendente' }, 9: {} } as const;
    expect(dotFor(dots, 3)).toEqual({ tone: 'warning', label: 'Pendente' });
    expect(dotFor(dots, 9)).toEqual({});
    expect(dotFor(dots, 10)).toBeNull();
  });

  it('does not take anything off the prototype for a day number', () => {
    expect(dotFor({}, 0)).toBeNull();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- a stray null from a JS caller must not throw
    expect(dotFor({ 4: null } as any, 4)).toEqual({});
  });
});

describe('dotStyle', () => {
  it('is a 6px circle, brand by default', () => {
    const s = dotStyle();
    expect(s.width).toBe(DOT_SIZE);
    expect(s.height).toBe(DOT_SIZE);
    expect(s.borderRadius).toBe('var(--radius-pill)');
    expect(s.background).toBe('var(--interactive-primary)');
    expect(s.opacity).toBe(1);
  });

  it.each([
    ['brand', '--interactive-primary'],
    ['success', '--status-success-dot'],
    ['warning', '--status-warning-dot'],
    ['error', '--status-error-dot'],
    ['info', '--status-info-dot'],
  ] as const)('%s paints with %s', (tone, token) => {
    expect(dotStyle(tone).background).toBe('var(' + token + ')');
  });

  it('on the selected day it turns to the text color for the primary fill, whatever the tone', () => {
    for (const tone of ['brand', 'success', 'warning', 'error', 'info'] as const) {
      expect(dotStyle(tone, { selected: true }).background).toBe('var(--interactive-primary-fg)');
    }
  });

  it('on a day that cannot be picked it fades, except when that day is the selected one', () => {
    expect(dotStyle('brand', { unavailable: true }).opacity).toBe(0.45);
    expect(dotStyle('brand', { unavailable: true, selected: true }).opacity).toBe(1);
  });
});
