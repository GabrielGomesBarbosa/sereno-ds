import * as React from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Button } from './Button';
import { IconButton } from './IconButton';
import { Card } from './Card';

afterEach(cleanup);

/**
 * Hover, press and keyboard focus of Button, IconButton and Card are CSS (SS-577): the component declares what each
 * state looks like as `--sd-*` custom properties and `styles.css` switches between them. jsdom has no :hover, so what
 * is tested here is the contract between the two halves (the values the component sets, the rules the stylesheet has);
 * the pixels of every state are the visual tests' (`apps/docs/e2e`).
 */
const v = (el: HTMLElement, name: string) => el.style.getPropertyValue(name);
const icon = <svg aria-hidden width={16} height={16} />;

describe('the class and the caller', () => {
  it('Button, IconButton and Card carry their stylesheet class, and the caller class next to it', () => {
    render(
      <>
        <Button className="mine">B</Button>
        <IconButton label="I" className="mine">
          {icon}
        </IconButton>
        <Card className="mine" data-testid="card">
          C
        </Card>
      </>,
    );
    expect(screen.getByRole('button', { name: 'B' })).toHaveClass('sereno-btn', 'mine');
    expect(screen.getByRole('button', { name: 'I' })).toHaveClass('sereno-btn', 'mine');
    expect(screen.getByTestId('card')).toHaveClass('sereno-card', 'mine');
  });

  it('an enabled Button leaves background, colour and shadow to the stylesheet, so a caller can restyle them', () => {
    render(<Button>B</Button>);
    const el = screen.getByRole('button');
    expect(el.style.background).toBe('');
    expect(el.style.color).toBe('');
    expect(el.style.boxShadow).toBe('');
    expect(el.style.transform).toBe('');
  });

  it('a style prop still wins over the stylesheet', () => {
    render(<Button style={{ background: 'red' }}>B</Button>);
    expect(screen.getByRole('button').style.background).toBe('red');
  });
});

describe('no state to re-render', () => {
  it.each([
    ['Button', <Button key="b">B</Button>, () => screen.getByRole('button')],
    [
      'IconButton',
      <IconButton key="i" label="I">
        {icon}
      </IconButton>,
      () => screen.getByRole('button'),
    ],
    [
      'Card',
      <Card key="c" interactive onClick={() => {}}>
        C
      </Card>,
      () => screen.getByRole('button'),
    ],
  ])('%s: the pointer and the focus change nothing on the element', (_name, element, get) => {
    render(element);
    const el = get() as HTMLElement;
    const before = el.outerHTML;
    fireEvent.mouseEnter(el);
    fireEvent.mouseOver(el);
    fireEvent.mouseDown(el);
    fireEvent.focus(el);
    expect(el.outerHTML).toBe(before);
    fireEvent.mouseUp(el);
    fireEvent.mouseLeave(el);
    fireEvent.blur(el);
    expect(el.outerHTML).toBe(before);
  });
});

describe('Button: the values of each variant', () => {
  it('primary: its own fill, a darker hover and press, and a brand shadow on hover', () => {
    render(<Button>B</Button>);
    const el = screen.getByRole('button');
    expect(v(el, '--sd-bg')).toBe('var(--interactive-primary)');
    expect(v(el, '--sd-bg-hover')).toBe('var(--interactive-primary-hover)');
    expect(v(el, '--sd-bg-active')).toBe('var(--interactive-primary-active)');
    expect(v(el, '--sd-sh')).toBe('var(--shadow-xs)');
    expect(v(el, '--sd-sh-hover')).toBe('var(--shadow-brand)');
  });

  it('accent: an accent shadow on hover and an accent focus ring', () => {
    render(<Button variant="accent">B</Button>);
    const el = screen.getByRole('button');
    expect(v(el, '--sd-sh-hover')).toBe('var(--shadow-accent)');
    expect(v(el, '--sd-ring')).toBe('var(--focus-ring-accent)');
  });

  it('secondary: a border, and its own hover and press fills', () => {
    render(<Button variant="secondary">B</Button>);
    const el = screen.getByRole('button');
    expect(v(el, '--sd-bd')).toBe('var(--border-default)');
    expect(v(el, '--sd-bg-hover')).toBe('var(--interactive-secondary-hover)');
    expect(v(el, '--sd-bg-active')).toBe('var(--interactive-secondary-active)');
  });

  it('ghost: transparent, a fill only on hover, no shadow', () => {
    render(<Button variant="ghost">B</Button>);
    const el = screen.getByRole('button');
    expect(v(el, '--sd-bg')).toBe('transparent');
    expect(v(el, '--sd-bg-hover')).toBe('var(--interactive-ghost-hover)');
    expect(v(el, '--sd-sh')).toBe('none');
  });

  it('link: the text colour changes on hover and is underlined, with no fill', () => {
    render(<Button variant="link">B</Button>);
    const el = screen.getByRole('button');
    expect(v(el, '--sd-bg')).toBe('transparent');
    expect(v(el, '--sd-bg-hover')).toBe('');
    expect(v(el, '--sd-fg')).toBe('var(--text-link)');
    expect(v(el, '--sd-fg-hover')).toBe('var(--text-link-hover)');
    expect(v(el, '--sd-deco-hover')).toBe('underline');
  });

  it.each(['success', 'warning', 'error'] as const)('%s: a hover fill and no separate press fill', (variant) => {
    render(<Button variant={variant}>B</Button>);
    const el = screen.getByRole('button');
    expect(v(el, '--sd-bg')).toBe(`var(--interactive-${variant})`);
    expect(v(el, '--sd-bg-hover')).toBe(`var(--interactive-${variant}-hover)`);
    expect(v(el, '--sd-bg-active')).toBe('');
  });

  it('disabled: one look, with no hover, press or ring values', () => {
    render(
      <Button variant="accent" disabled>
        B
      </Button>,
    );
    const el = screen.getByRole('button');
    expect(v(el, '--sd-bg')).toBe('var(--interactive-disabled-bg)');
    expect(v(el, '--sd-fg')).toBe('var(--interactive-disabled-fg)');
    expect(v(el, '--sd-sh')).toBe('none');
    expect(v(el, '--sd-bg-hover')).toBe('');
    expect(v(el, '--sd-ring')).toBe('');
    expect(el.style.cursor).toBe('not-allowed');
  });

  it('loading: keeps its variant look (dimmed) and is a disabled element, which the stylesheet leaves out of every state', () => {
    render(<Button loading>B</Button>);
    const el = screen.getByRole('button');
    expect(el).toBeDisabled();
    expect(v(el, '--sd-bg')).toBe('var(--interactive-primary)');
    expect(el.style.opacity).toBe('0.75');
  });
});

describe('IconButton: the values of each variant', () => {
  it('ghost (default): transparent with a hover fill', () => {
    render(<IconButton label="I">{icon}</IconButton>);
    const el = screen.getByRole('button');
    expect(v(el, '--sd-bg')).toBe('transparent');
    expect(v(el, '--sd-bg-hover')).toBe('var(--interactive-ghost-hover)');
    expect(v(el, '--sd-bd')).toBe('transparent');
  });

  it('secondary: framed, with its own hover fill', () => {
    render(
      <IconButton label="I" variant="secondary">
        {icon}
      </IconButton>,
    );
    const el = screen.getByRole('button');
    expect(v(el, '--sd-bd')).toBe('var(--border-default)');
    expect(v(el, '--sd-bg')).toBe('var(--interactive-secondary)');
    expect(v(el, '--sd-bg-hover')).toBe('var(--interactive-secondary-hover)');
  });

  it.each(['primary', 'success', 'warning', 'error'] as const)('%s: a solid fill with its hover fill and text colour', (variant) => {
    render(
      <IconButton label="I" variant={variant}>
        {icon}
      </IconButton>,
    );
    const el = screen.getByRole('button');
    expect(v(el, '--sd-bg')).toBe(`var(--interactive-${variant})`);
    expect(v(el, '--sd-bg-hover')).toBe(`var(--interactive-${variant}-hover)`);
    expect(v(el, '--sd-fg')).toBe(`var(--interactive-${variant}-fg)`);
  });

  it('disabled: the disabled look and no hover fill (a secondary one keeps its frame, as it always did)', () => {
    render(
      <IconButton label="I" variant="secondary" disabled>
        {icon}
      </IconButton>,
    );
    const el = screen.getByRole('button');
    expect(v(el, '--sd-bg')).toBe('var(--interactive-disabled-bg)');
    expect(v(el, '--sd-bg-hover')).toBe('');
    expect(v(el, '--sd-bd')).toBe('var(--border-default)');
  });
});

describe('Card: the ring and the drop shadow, each with its hover value', () => {
  const card = () => screen.getByTestId('card');

  it('a plain Card: the default ring and a small drop shadow, no data attributes', () => {
    render(<Card data-testid="card">C</Card>);
    expect(v(card(), '--sd-ring')).toBe('0 0 0 1px var(--border-default)');
    expect(v(card(), '--sd-drop')).toBe('var(--shadow-xs)');
    expect(card()).not.toHaveAttribute('data-interactive');
    expect(card()).not.toHaveAttribute('data-clickable');
  });

  it('interactive: marked for the lift and press rules, with a stronger ring and a bigger shadow on hover', () => {
    render(
      <Card data-testid="card" interactive>
        C
      </Card>,
    );
    expect(card()).toHaveAttribute('data-interactive', 'true');
    expect(card()).not.toHaveAttribute('data-clickable'); // no onClick: it borrows the look inside another control
    expect(card()).not.toHaveAttribute('tabindex');
    expect(v(card(), '--sd-ring-h')).toBe('0 0 0 1px var(--border-strong)');
    expect(v(card(), '--sd-drop-h')).toBe('var(--shadow-md)');
  });

  it('interactive with onClick: a real button, marked for the focus ring too', () => {
    render(
      <Card data-testid="card" interactive onClick={() => {}}>
        C
      </Card>,
    );
    expect(card()).toHaveAttribute('data-clickable', 'true');
    expect(card()).toHaveAttribute('role', 'button');
    expect(card()).toHaveAttribute('tabindex', '0');
    expect(card().style.outline).toBe('none');
  });

  it('selected: a brand ring that does not change on hover, and a medium shadow in both states', () => {
    render(
      <Card data-testid="card" interactive selected>
        C
      </Card>,
    );
    expect(v(card(), '--sd-ring')).toBe('0 0 0 1.5px var(--border-brand)');
    expect(v(card(), '--sd-ring-h')).toBe(v(card(), '--sd-ring'));
    expect(v(card(), '--sd-drop')).toBe('var(--shadow-md)');
    expect(v(card(), '--sd-drop-h')).toBe('var(--shadow-md)');
  });

  it('elevation: none has a drop that draws nothing (so the shadow list stays valid), and lg lifts to a large one', () => {
    const { rerender } = render(
      <Card data-testid="card" elevation="none">
        C
      </Card>,
    );
    expect(v(card(), '--sd-drop')).toBe('0 0 0 0 transparent');
    rerender(
      <Card data-testid="card" elevation="lg" interactive>
        C
      </Card>,
    );
    expect(v(card(), '--sd-drop')).toBe('var(--shadow-lg)');
    expect(v(card(), '--sd-drop-h')).toBe('var(--shadow-lg)');
  });

  it('draws no shadow or transform of its own on the element: the stylesheet does', () => {
    render(
      <Card data-testid="card" interactive>
        C
      </Card>,
    );
    expect(card().style.boxShadow).toBe('');
    expect(card().style.transform).toBe('');
  });
});

describe('the stylesheet has the rules the components rely on', () => {
  const css = readFileSync(resolve(__dirname, '../styles.css'), 'utf8');

  it('Button and IconButton: base, hover, press and focus-visible, in that order, none of them on a disabled control', () => {
    const at = (s: string) => css.indexOf(s);
    const base = at('.sereno-btn {');
    const hover = at('.sereno-btn:hover:where(:not(:disabled))');
    const active = at('.sereno-btn:active:where(:not(:disabled))');
    const focus = at('.sereno-btn:focus-visible:where(:not(:disabled))');
    expect([base, hover, active, focus].every((i) => i >= 0)).toBe(true);
    expect(base).toBeLessThan(hover);
    expect(hover).toBeLessThan(active);
    expect(active).toBeLessThan(focus); // the focus ring wins over a hover or press shadow
  });

  it('Card: hover lift, press scale and the focus ring, with and without hover', () => {
    for (const rule of [
      '.sereno-card[data-interactive]:hover {',
      '.sereno-card[data-interactive]:active {',
      '.sereno-card[data-clickable]:focus-visible {',
      '.sereno-card[data-clickable]:hover:focus-visible {',
    ]) {
      expect(css).toContain(rule);
    }
  });
});
