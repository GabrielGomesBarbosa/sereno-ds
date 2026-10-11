import * as React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { Typography } from './Typography';

afterEach(cleanup);

describe('Typography', () => {
  it('defaults to the body variant, rendered as a <p>', () => {
    render(<Typography>Hello</Typography>);
    const el = screen.getByText('Hello');
    expect(el.tagName).toBe('P');
  });

  it('renders each variant with its own default tag', () => {
    const cases: [Parameters<typeof Typography>[0]['variant'], string][] = [
      ['display', 'H1'],
      ['h1', 'H1'],
      ['h2', 'H2'],
      ['h3', 'H3'],
      ['body', 'P'],
      ['bodySm', 'P'],
      ['label', 'SPAN'],
      ['caption', 'SPAN'],
      ['eyebrow', 'SPAN'],
    ];
    for (const [variant, tag] of cases) {
      const { unmount } = render(<Typography variant={variant}>{variant}</Typography>);
      expect(screen.getByText(String(variant)).tagName, `variant ${variant}`).toBe(tag);
      unmount();
    }
  });

  it('`as` overrides the tag without changing the variant styling', () => {
    render(
      <Typography variant="h1" as="div">
        Not a heading
      </Typography>,
    );
    const el = screen.getByText('Not a heading');
    expect(el.tagName).toBe('DIV');
    expect(el.style.fontSize).toBe('var(--text-3xl)');
  });

  it('each variant falls back to its own default color', () => {
    render(<Typography variant="caption">Muted by default</Typography>);
    expect(screen.getByText('Muted by default').style.color).toBe('var(--text-muted)');
  });

  it('`color` overrides the variant default', () => {
    render(
      <Typography variant="caption" color="error">
        Now red
      </Typography>,
    );
    expect(screen.getByText('Now red').style.color).toBe('var(--interactive-error)');
  });

  it('`truncate` applies single-line ellipsis styling, including `display: block` (a plain inline box ignores text-overflow)', () => {
    render(
      <Typography variant="label" truncate>
        A very long line of text
      </Typography>,
    );
    const el = screen.getByText('A very long line of text');
    expect(el.style.display).toBe('block');
    expect(el.style.overflow).toBe('hidden');
    expect(el.style.textOverflow).toBe('ellipsis');
    expect(el.style.whiteSpace).toBe('nowrap');
  });

  it('without truncate, no ellipsis styling is applied', () => {
    render(<Typography>Plain text</Typography>);
    const el = screen.getByText('Plain text');
    expect(el.style.textOverflow).toBe('');
  });

  it('`numeric` applies tabular-nums, for figures that need to line up (queue numbers, times, prices)', () => {
    render(
      <Typography variant="display" numeric>
        A002
      </Typography>,
    );
    expect(screen.getByText('A002').style.fontVariantNumeric).toBe('tabular-nums');
  });

  it('without `numeric`, no font-variant-numeric styling is applied', () => {
    render(<Typography>Plain text</Typography>);
    expect(screen.getByText('Plain text').style.fontVariantNumeric).toBe('');
  });

  it('a caller-provided style wins over the variant/color defaults', () => {
    render(
      <Typography variant="h1" color="error" style={{ color: 'red', fontSize: '10px' }}>
        Overridden
      </Typography>,
    );
    const el = screen.getByText('Overridden');
    expect(el.style.color).toBe('red');
    expect(el.style.fontSize).toBe('10px');
  });
});

/**
 * `success` and `inherit` (SS-452). The color is painted inline, so a color class passed to a
 * `Typography` never won and the app worked around it with `style={{ color: 'inherit' }}` and the
 * color on a parent. Both are now a value of `color`; nothing that existed changes.
 */
describe('Typography, color: success and inherit', () => {
  it('`success` is the text green, var(--status-success-fg)', () => {
    render(<Typography color="success">8+ characters</Typography>);
    expect(screen.getByText('8+ characters').style.color).toBe('var(--status-success-fg)');
  });

  it('`inherit` is `color: inherit`, with no token behind it', () => {
    render(<Typography color="inherit">On a strip</Typography>);
    const el = screen.getByText('On a strip');
    expect(el.style.color).toBe('inherit');
    // no `color: var(...)` declaration (the other var()s in the style are the variant's own size, weight, ...)
    expect(el.getAttribute('style')).not.toMatch(/(^|;)\s*color:\s*var\(/);
  });

  it('`inherit` leaves the color to the parent: it declares none of its own, and the strip keeps its own', () => {
    // jsdom does not resolve `inherit` to the parent's value (a real browser does, and the showcase
    // was checked in one); what is asserted here is who is left holding the color.
    render(
      <div data-testid="strip" style={{ color: 'rgb(11, 22, 33)', background: 'rgb(200, 0, 0)' }}>
        <Typography color="inherit">Header text</Typography>
        <Typography>Default text</Typography>
      </div>,
    );
    const strip = screen.getByTestId('strip');
    expect(strip.style.color).toBe('rgb(11, 22, 33)'); // the Typography does not touch its parent
    expect(screen.getByText('Header text').parentElement).toBe(strip);
    expect(screen.getByText('Header text').style.color).toBe('inherit');
    // a Typography with no `color` still paints its own token, so the strip's color never reaches it
    expect(screen.getByText('Default text').style.color).toBe('var(--text-primary)');
  });

  it('`inherit` goes back to its own variant color when `color` is dropped', () => {
    const { rerender } = render(<Typography variant="caption" color="inherit">Switch</Typography>);
    expect(screen.getByText('Switch').style.color).toBe('inherit');
    rerender(<Typography variant="caption">Switch</Typography>);
    expect(screen.getByText('Switch').style.color).toBe('var(--text-muted)');
  });

  it.each(['success', 'inherit'] as const)('the consumer `style` still has the last word over `%s`', (color) => {
    render(
      <Typography color={color} style={{ color: 'rgb(5, 6, 7)' }}>
        Mine
      </Typography>,
    );
    expect(screen.getByText('Mine').style.color).toBe('rgb(5, 6, 7)');
  });

  it.each(['success', 'inherit'] as const)('`%s` changes the color only: the variant keeps its size, weight and tag', (color) => {
    render(
      <Typography variant="label" color={color}>
        Label
      </Typography>,
    );
    const el = screen.getByText('Label');
    expect(el.tagName).toBe('SPAN');
    expect(el.style.fontSize).toBe('var(--text-sm)');
    expect(el.style.fontWeight).toBe('var(--weight-semibold)');
  });

  it('works on every variant, as any color does', () => {
    for (const variant of ['display', 'h1', 'h2', 'h3', 'body', 'bodySm', 'label', 'caption', 'eyebrow'] as const) {
      const { unmount } = render(
        <>
          <Typography variant={variant} color="success">
            ok-{variant}
          </Typography>
          <Typography variant={variant} color="inherit">
            in-{variant}
          </Typography>
        </>,
      );
      expect(screen.getByText('ok-' + variant).style.color, variant).toBe('var(--status-success-fg)');
      expect(screen.getByText('in-' + variant).style.color, variant).toBe('inherit');
      unmount();
    }
  });
});

/** Only added to: every color and every variant default that existed keeps painting what it painted. */
describe('Typography, nothing that existed changes', () => {
  it.each([
    ['primary', 'var(--text-primary)'],
    ['secondary', 'var(--text-secondary)'],
    ['muted', 'var(--text-muted)'],
    ['disabled', 'var(--text-disabled)'],
    ['inverse', 'var(--text-inverse)'],
    ['brand', 'var(--text-brand)'],
    ['accent', 'var(--text-accent)'],
    ['link', 'var(--text-link)'],
    ['error', 'var(--interactive-error)'],
  ] as const)('color="%s" is still %s', (color, expected) => {
    render(<Typography color={color}>x</Typography>);
    expect(screen.getByText('x').style.color).toBe(expected);
  });

  it.each([
    ['display', 'var(--text-primary)'],
    ['h1', 'var(--text-primary)'],
    ['h2', 'var(--text-primary)'],
    ['h3', 'var(--text-primary)'],
    ['body', 'var(--text-primary)'],
    ['bodySm', 'var(--text-secondary)'],
    ['label', 'var(--text-primary)'],
    ['caption', 'var(--text-muted)'],
    ['eyebrow', 'var(--text-muted)'],
  ] as const)('variant "%s" with no color still paints %s', (variant, expected) => {
    render(<Typography variant={variant}>y</Typography>);
    expect(screen.getByText('y').style.color).toBe(expected);
  });
});

