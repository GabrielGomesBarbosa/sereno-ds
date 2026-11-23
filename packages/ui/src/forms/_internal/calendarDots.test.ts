import { describe, expect, it } from 'vitest';
import { dotFor, dotProps, dotStyle, DOT_CLASS, DOT_SIZE } from './calendarDots';

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
  it('is a 6px dot, brand by default, with its fill as the --sd-dot value (never an inline background)', () => {
    const s = dotStyle() as Record<string, unknown>;
    expect(s.width).toBe(DOT_SIZE);
    expect(s.height).toBe(DOT_SIZE);
    expect(s['--sd-dot']).toBe('var(--interactive-primary)');
    expect(s.opacity).toBe(1);
    // an inline background or border-radius would beat the forced-colors rules that redraw the dot (#157)
    expect(s).not.toHaveProperty('background');
    expect(s).not.toHaveProperty('borderRadius');
  });

  it.each([
    ['brand', '--interactive-primary'],
    ['success', '--status-success-dot'],
    ['warning', '--status-warning-dot'],
    ['error', '--status-error-dot'],
    ['info', '--status-info-dot'],
  ] as const)('%s paints with %s', (tone, token) => {
    expect((dotStyle(tone) as Record<string, unknown>)['--sd-dot']).toBe('var(' + token + ')');
  });

  it('on the selected day it turns to the text color for the primary fill, whatever the tone', () => {
    for (const tone of ['brand', 'success', 'warning', 'error', 'info'] as const) {
      expect((dotStyle(tone, { selected: true }) as Record<string, unknown>)['--sd-dot']).toBe('var(--interactive-primary-fg)');
    }
  });

  it('on a day that cannot be picked it fades, except when that day is the selected one', () => {
    expect(dotStyle('brand', { unavailable: true }).opacity).toBe(0.45);
    expect(dotStyle('brand', { unavailable: true, selected: true }).opacity).toBe(1);
  });
});

describe('dotProps', () => {
  it('carries the class the stylesheet styles and the tone forced colors draws as a shape', () => {
    const p = dotProps('warning');
    expect(p.className).toBe(DOT_CLASS);
    expect(p['data-tone']).toBe('warning');
    expect(dotProps()['data-tone']).toBe('brand');
  });

  it('merges the caller style over the dot style', () => {
    const p = dotProps('info', {}, { alignSelf: 'center' });
    expect(p.style.alignSelf).toBe('center');
    expect((p.style as Record<string, unknown>)['--sd-dot']).toBe('var(--status-info-dot)');
  });
});
