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
