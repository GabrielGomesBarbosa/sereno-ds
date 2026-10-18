import * as React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { Badge } from './Badge';

afterEach(cleanup);

const style = (el: Element | null | undefined) => el?.getAttribute('style') ?? '';
const root = (c: HTMLElement) => c.firstElementChild as HTMLElement;

// What Badge drew for its dot before it had `pulse`, tone by tone. The dot is not allowed to
// change by a character when `pulse` is off (SS-516).
const DOT = (px: number, token: string) => `width: ${px}px; height: ${px}px; border-radius: 999px; background: var(${token}); flex: 0 0 auto;`;
const TONE_TOKEN = {
  success: '--status-success-dot',
  warning: '--status-warning-dot',
  error: '--status-error-dot',
  info: '--status-info-dot',
  neutral: '--text-muted',
} as const;

describe('Badge: the dot (nothing that existed changes)', () => {
  for (const tone of Object.keys(TONE_TOKEN) as (keyof typeof TONE_TOKEN)[]) {
    it(`${tone}: the same 6px / 5px dot, as a plain span, byte for byte`, () => {
      const md = render(<Badge tone={tone}>Texto</Badge>);
      expect(root(md.container).firstElementChild?.outerHTML).toBe(`<span style="${DOT(6, TONE_TOKEN[tone])}"></span>`);
      md.unmount();
      const sm = render(<Badge tone={tone} size="sm">Texto</Badge>);
      expect(root(sm.container).firstElementChild?.outerHTML).toBe(`<span style="${DOT(5, TONE_TOKEN[tone])}"></span>`);
    });
  }

  it('the default tone is neutral, with its dot', () => {
    const { container } = render(<Badge>Texto</Badge>);
    expect(root(container).firstElementChild?.outerHTML).toBe(`<span style="${DOT(6, '--text-muted')}"></span>`);
  });

  it('an unknown tone still falls back to neutral', () => {
    const { container } = render(<Badge tone={'nope' as 'neutral'}>Texto</Badge>);
    expect(root(container).firstElementChild?.outerHTML).toBe(`<span style="${DOT(6, '--text-muted')}"></span>`);
  });

  it('dot={false} draws no dot, and the label is the only child', () => {
    const { container } = render(<Badge dot={false}>Texto</Badge>);
    expect(root(container).children).toHaveLength(0);
    expect(root(container)).toHaveTextContent('Texto');
  });

  it('without pulse there is no ring: a dot and the label, nothing else', () => {
    const { container } = render(<Badge tone="success">Aberto</Badge>);
    expect(container.querySelector('.sereno-status-ping')).toBeNull();
    expect(root(container).childNodes).toHaveLength(2);
  });

  it('the pill keeps its colors for every tone', () => {
    const { container } = render(<Badge tone="warning">Texto</Badge>);
    expect(style(root(container))).toContain('background: var(--status-warning-bg)');
    expect(style(root(container))).toContain('color: var(--status-warning-fg)');
  });
});

describe('Badge pulse', () => {
  it('rings the dot, in the tone of the badge', () => {
    const { container } = render(<Badge tone="success" pulse>Aberto agora</Badge>);
    const ring = root(container).querySelector('.sereno-status-ping') as HTMLElement;
    expect(ring).not.toBeNull();
    expect(style(ring)).toContain('background: var(--status-success-dot)');
    expect(root(container)).toHaveTextContent('Aberto agora');
  });

  it('the pulsing dot is the size of the badge: 6px, and 5px on sm', () => {
    const md = render(<Badge tone="success" pulse>A</Badge>);
    expect(style(root(md.container).firstElementChild)).toContain('width: 6px; height: 6px');
    md.unmount();
    const sm = render(<Badge tone="success" size="sm" pulse>A</Badge>);
    expect(style(root(sm.container).firstElementChild)).toContain('width: 5px; height: 5px');
  });

  it('is ignored without a dot: no dot, no ring', () => {
    const { container } = render(<Badge tone="success" dot={false} pulse>Aberto</Badge>);
    expect(container.querySelector('.sereno-status-ping')).toBeNull();
    expect(root(container).children).toHaveLength(0);
  });

  it('is decorative: it adds nothing a screen reader would read', () => {
    const { container } = render(<Badge tone="success" pulse>Aberto agora</Badge>);
    expect(root(container).textContent).toBe('Aberto agora');
    expect(container.querySelector('[role="img"]')).toBeNull();
  });
});
