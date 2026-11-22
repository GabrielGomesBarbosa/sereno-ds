import * as React from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Button } from './Button';
import { IconButton } from './IconButton';
import { Card } from './Card';
import { ActionCard } from './ActionCard';
import { Checkbox } from '../forms/Checkbox';
import { Radio } from '../forms/Radio';
import { AvatarUpload } from '../forms/AvatarUpload';
import { Input } from '../forms/Input';
import { Textarea } from '../forms/Textarea';
import { Select } from '../forms/Select';
import { Autocomplete } from '../forms/Autocomplete';
import { DatePicker } from '../forms/DatePicker';
import { SidebarNav } from '../navigation/SidebarNav';

afterEach(cleanup);

/**
 * Hover, press and keyboard focus of Button, IconButton, Card, ActionCard, the rows and the collapse control of SidebarNav,
 * Checkbox, Radio and the actions of AvatarUpload are CSS (SS-577), and so is the border colour and focus ring of
 * Input, Textarea, Select, DatePicker and Autocomplete (SS-582): the component declares what each
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
    ['ActionCard', <ActionCard key="a" title="A" />, () => screen.getByRole('button')],
    ['Checkbox row', <Checkbox key="k" label="K" />, () => screen.getByText('K').closest('label') as HTMLElement],
    ['Radio row', <Radio key="r" label="R" />, () => screen.getByText('R').closest('label') as HTMLElement],
    ['Input row', <Input key="n" label="N" />, () => screen.getByLabelText('N').parentElement as HTMLElement],
    ['Textarea', <Textarea key="t" label="T" />, () => screen.getByLabelText('T')],
    [
      'SidebarNav item',
      <SidebarNav key="s" value="a" collapsible={false}>
        <SidebarNav.Item value="b" label="B" />
      </SidebarNav>,
      () => screen.getByRole('button', { name: 'B' }),
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

describe('SidebarNav rows: the fill and its hover value', () => {
  const nav = (props: { value?: string; disabled?: boolean; itemDisabled?: boolean } = {}) =>
    render(
      <SidebarNav value={props.value ?? 'a'} disabled={props.disabled} collapsible={false}>
        <SidebarNav.Item value="a" label="A" />
        <SidebarNav.Item value="b" label="B" disabled={props.itemDisabled} />
        <SidebarNav.Item value="c" label="C">
          <SidebarNav.SubItem value="c1" label="C1" />
        </SidebarNav.Item>
      </SidebarNav>,
    );
  const row = (name: string) => screen.getByRole('button', { name });

  it('an ordinary row is transparent, with the ghost fill as its hover value', () => {
    nav();
    expect(row('B')).toHaveClass('sereno-sidenav-btn', 'sereno-sidenav-row');
    expect(v(row('B'), '--sd-bg')).toBe('transparent');
    expect(v(row('B'), '--sd-bg-hover')).toBe('var(--interactive-ghost-hover)');
    expect(row('B').style.background).toBe(''); // the stylesheet paints it, so a caller can restyle the hover
  });

  it('the current page keeps its brand fill under the pointer: no hover value', () => {
    nav({ value: 'a' });
    expect(v(row('A'), '--sd-bg')).toBe('var(--bg-brand-soft)');
    expect(v(row('A'), '--sd-bg-hover')).toBe('');
  });

  it('a disabled row (its own, or the whole nav) has no hover value', () => {
    const { unmount } = nav({ itemDisabled: true });
    expect(v(row('B'), '--sd-bg-hover')).toBe('');
    unmount();
    nav({ disabled: true });
    expect(v(row('B'), '--sd-bg-hover')).toBe('');
  });

  it('an open parent keeps the ghost fill at rest, and a sub item has the same pair of values', () => {
    nav();
    fireEvent.click(row('C'));
    expect(v(row('C'), '--sd-bg')).toBe('var(--interactive-ghost-hover)');
    expect(row('C1')).toHaveClass('sereno-sidenav-row');
    expect(v(row('C1'), '--sd-bg')).toBe('transparent');
    expect(v(row('C1'), '--sd-bg-hover')).toBe('var(--interactive-ghost-hover)');
  });

  it('a sub item that is the current page keeps its brand fill', () => {
    nav({ value: 'c1' }); // the branch holding the current page starts open
    expect(v(row('C1'), '--sd-bg')).toBe('var(--bg-brand-soft)');
    expect(v(row('C1'), '--sd-bg-hover')).toBe('');
  });
});

describe('Checkbox and Radio: the row carries the border colours', () => {
  it.each([
    ['Checkbox', () => render(<Checkbox label="K" />), 'K', 'sereno-check'],
    ['Radio', () => render(<Radio label="R" />), 'R', 'sereno-radio'],
  ])('%s: no error sets nothing, so the stylesheet fallbacks (strong at rest, brand on hover) apply', (_n, draw, text, cls) => {
    draw();
    const row = screen.getByText(text).closest('label') as HTMLElement;
    expect(row).toHaveClass('sereno-choice');
    expect(row.style.getPropertyValue('--sd-bd')).toBe('');
    expect(row.style.getPropertyValue('--sd-bd-hover')).toBe('');
    const box = row.querySelector('input') as HTMLInputElement;
    expect(box).toHaveClass(cls);
    expect(box.style.borderColor).toBe(''); // the colour is the stylesheet's, so the hover can change it
    expect(box.style.borderStyle).toBe('solid');
    expect(box.style.borderWidth).toBe('var(--border-width-emphasis)');
  });

  it('an error keeps the error colour under the pointer too, and a style prop still reaches the row', () => {
    render(<Checkbox label="K" error="No" style={{ marginTop: 3 }} />);
    const row = screen.getByText('K').closest('label') as HTMLElement;
    expect(row.style.getPropertyValue('--sd-bd')).toBe('var(--interactive-error)');
    expect(row.style.getPropertyValue('--sd-bd-hover')).toBe('var(--interactive-error)');
    expect(row.style.marginTop).toBe('3px');
  });
});

describe('AvatarUpload: the actions of its menu', () => {
  it('are menu items with the stylesheet class and no fill of their own', () => {
    render(<AvatarUpload label="Photo" />);
    fireEvent.click(screen.getByRole('button', { name: 'Change photo' }));
    const items = screen.getAllByRole('menuitem');
    expect(items.length).toBeGreaterThan(1);
    for (const item of items) {
      expect(item).toHaveClass('sereno-menuitem');
      expect(item.style.background).toBe('');
    }
  });
});

describe('SidebarNav collapse control: fill, ink and border, each with its hover value', () => {
  it('declares the values and sets none of the three inline, so the stylesheet hover can show', () => {
    render(
      <SidebarNav value="a">
        <SidebarNav.Item value="a" label="A" />
      </SidebarNav>,
    );
    const toggle = screen.getByRole('button', { name: 'Collapse' });
    expect(toggle).toHaveClass('sereno-sidenav-btn', 'sereno-sidenav-toggle');
    expect(v(toggle, '--sd-bg')).toBe('var(--bg-surface)');
    expect(v(toggle, '--sd-bg-hover')).toBe('var(--interactive-secondary-hover)');
    expect(v(toggle, '--sd-fg')).toBe('var(--text-secondary)');
    expect(v(toggle, '--sd-fg-hover')).toBe('var(--text-primary)');
    expect(v(toggle, '--sd-bd')).toBe('var(--border-default)');
    expect(v(toggle, '--sd-bd-hover')).toBe('var(--border-strong)');
    // An inline value beats every stylesheet rule: this is what kept the hover from ever showing.
    expect(toggle.style.background).toBe('');
    expect(toggle.style.color).toBe('');
    expect(toggle.style.borderColor).toBe('');
  });
});

describe('text fields: the frame carries the border colours', () => {
  it('the three boxes that open something are field frames, active only while open', () => {
    render(
      <>
        <Select label="S" options={[{ value: 'a', label: 'A' }]} />
        <Autocomplete label="Au" options={[{ value: 'a', label: 'Apple' }]} />
        <DatePicker label="Dp" />
      </>,
    );
    const boxes = [
      screen.getByRole('combobox', { name: 'S' }),
      (screen.getByRole('combobox', { name: 'Au' }) as HTMLElement).parentElement as HTMLElement,
      screen.getByRole('button', { name: 'Dp' }).parentElement as HTMLElement,
    ];
    for (const box of boxes) {
      expect(box).toHaveClass('sereno-field');
      expect(box).not.toHaveAttribute('data-active');
      expect(v(box, '--sd-bd')).toBe('var(--border-default)');
      expect(v(box, '--sd-bd-active')).toBe('var(--border-focus)');
      expect(v(box, '--sd-ring-active')).toBe('var(--focus-ring)');
      expect(box.style.borderColor).toBe('');
      expect(box.style.boxShadow).toBe('');
    }
    fireEvent.keyDown(boxes[0], { key: 'ArrowDown' });
    fireEvent.keyDown(screen.getByRole('combobox', { name: 'Au' }), { key: 'ArrowDown' });
    fireEvent.click(screen.getByRole('button', { name: 'Dp' }));
    for (const box of boxes) expect(box).toHaveAttribute('data-active');
  });

  it('an error keeps its border in both states and has no ring, on every box', () => {
    render(
      <>
        <Select label="S" error="x" options={[{ value: 'a', label: 'A' }]} />
        <Autocomplete label="Au" error="x" options={[{ value: 'a', label: 'Apple' }]} />
        <DatePicker label="Dp" error="x" />
      </>,
    );
    const boxes = [
      screen.getByRole('combobox', { name: 'S' }),
      (screen.getByRole('combobox', { name: 'Au' }) as HTMLElement).parentElement as HTMLElement,
      screen.getByRole('button', { name: 'Dp' }).parentElement as HTMLElement,
    ];
    for (const box of boxes) {
      expect(v(box, '--sd-bd')).toBe('var(--interactive-error)');
      expect(v(box, '--sd-bd-active')).toBe('var(--interactive-error)');
      expect(v(box, '--sd-ring-active')).toBe('none');
    }
  });

  it('the Autocomplete box does not change when its text box takes or loses the focus (the stylesheet reads the :focus)', () => {
    const { container } = render(<Autocomplete label="Au" options={[{ value: 'a', label: 'Apple' }]} />);
    const input = screen.getByRole('combobox', { name: 'Au' });
    const before = container.innerHTML;
    fireEvent.focus(input);
    expect(container.innerHTML).toBe(before);
    fireEvent.blur(input);
    expect(container.innerHTML).toBe(before);
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

  it('ActionCard: hover, press and focus, with and without hover, none of them on a disabled card but the focus ring', () => {
    for (const rule of [
      '.sereno-action {',
      '.sereno-action:hover:where(:not(:disabled)) {',
      '.sereno-action:active:where(:not(:disabled)) {',
      '.sereno-action:focus-visible {',
      '.sereno-action:hover:focus-visible:where(:not(:disabled)) {',
    ]) {
      expect(css).toContain(rule);
    }
    // The focus ring is drawn on top of the ring in use: a hover ring when hovered, the rest ring otherwise.
    expect(css).toMatch(/\.sereno-action:focus-visible \{\s*box-shadow: var\(--sd-ring\), var\(--focus-ring\);/);
    expect(css).toMatch(/\.sereno-action:hover:focus-visible:where\(:not\(:disabled\)\) \{\s*box-shadow: var\(--sd-ring-hover, var\(--sd-ring\)\), var\(--focus-ring\);/);
  });

  it('SidebarNav rows: a base fill and a hover fill that falls back to it', () => {
    expect(css).toMatch(/\.sereno-sidenav-row \{\s*background: var\(--sd-bg, transparent\);/);
    expect(css).toMatch(/\.sereno-sidenav-row:hover \{\s*background: var\(--sd-bg-hover, var\(--sd-bg, transparent\)\);/);
  });

  it('Checkbox and Radio: the border colour at rest, and the hover one only on an enabled box inside the hovered row', () => {
    expect(css).toMatch(/\.sereno-check,\s*\.sereno-radio \{\s*border-color: var\(--sd-bd, var\(--border-strong\)\);/);
    expect(css).toContain('.sereno-choice:hover .sereno-check:where(:not(:disabled))');
    expect(css).toContain('.sereno-choice:hover .sereno-radio:where(:not(:disabled))');
    expect(css).toMatch(/border-color: var\(--sd-bd-hover, var\(--border-brand\)\);/);
  });

  it('text fields: border colour at rest, and the active one (a focused text box, a focused textarea, or data-active)', () => {
    expect(css).toMatch(/\.sereno-field \{\s*border-color: var\(--sd-bd, var\(--border-default\)\);\s*box-shadow: none;/);
    expect(css).toMatch(
      /\.sereno-field:where\(textarea:focus, :has\(> input:focus\), \[data-active\]\) \{\s*border-color: var\(--sd-bd-active, var\(--border-focus\)\);\s*box-shadow: var\(--sd-ring-active, var\(--focus-ring\)\);/,
    );
    // The active rule comes after the base one, at the same specificity, so it wins.
    expect(css.indexOf('.sereno-field:where(')).toBeGreaterThan(css.indexOf('.sereno-field {'));
  });

  it('SidebarNav collapse control: a base from the values and a hover that falls back to them', () => {
    expect(css).toMatch(/\.sereno-sidenav-toggle \{\s*background: var\(--sd-bg\);\s*color: var\(--sd-fg\);\s*border-color: var\(--sd-bd\);/);
    expect(css).toMatch(
      /\.sereno-sidenav-toggle:hover \{\s*background: var\(--sd-bg-hover, var\(--sd-bg\)\);\s*color: var\(--sd-fg-hover, var\(--sd-fg\)\);\s*border-color: var\(--sd-bd-hover, var\(--sd-bd\)\);/,
    );
  });

  it('menu items: transparent, and a subtle fill on hover unless disabled', () => {
    expect(css).toMatch(/\.sereno-menuitem \{\s*background: transparent;/);
    expect(css).toMatch(/\.sereno-menuitem:hover:where\(:not\(:disabled\)\) \{\s*background: var\(--bg-subtle\);/);
  });
});
