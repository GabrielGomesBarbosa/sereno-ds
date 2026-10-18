import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActionCard } from './ActionCard';

afterEach(cleanup);

const style = (el: Element | null | undefined) => el?.getAttribute('style') ?? '';
const icon = <svg data-testid="icon" width={20} height={20} />;

describe('ActionCard: the control', () => {
  it('is a real button that does not submit a form, named by its title and description', () => {
    render(<ActionCard title="Reagendar" description="Escolher outro horário" />);
    const btn = screen.getByRole('button', { name: 'Reagendar Escolher outro horário' });
    expect(btn.tagName).toBe('BUTTON');
    expect(btn).toHaveAttribute('type', 'button');
  });

  it('the title is not a heading: it must not enter the document outline from inside a button', () => {
    render(<ActionCard title="Reagendar" />);
    expect(screen.queryByRole('heading')).toBeNull();
  });

  it('a click calls onClick', () => {
    const onClick = vi.fn();
    render(<ActionCard title="Reagendar" onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is operable from the keyboard: it takes focus, and Enter and Space press it', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ActionCard title="Reagendar" onClick={onClick} />);
    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('disabled: not clickable, not focusable, and says so', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ActionCard title="Reagendar" disabled onClick={onClick} />);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    await user.click(btn);
    await user.tab();
    expect(onClick).not.toHaveBeenCalled();
    expect(btn).not.toHaveFocus();
  });

  it('className, other attributes and style reach the button, the style after its own', () => {
    render(<ActionCard title="A" className="mine" data-testid="ac" style={{ borderRadius: 4 }} />);
    const btn = screen.getByTestId('ac');
    expect(btn).toHaveClass('mine');
    expect(style(btn)).toContain('border-radius: 4px');
  });

  it('a type the caller passes stands (a card inside a form that submits)', () => {
    render(<ActionCard title="Enviar" type="submit" />);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });
});

describe('ActionCard: selected is a toggle, not a radio', () => {
  it('left out: a plain action, no aria-pressed', () => {
    render(<ActionCard title="A" />);
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-pressed');
  });

  it('true and false both report aria-pressed', () => {
    const { rerender } = render(<ActionCard title="A" selected />);
    expect(screen.getByRole('button', { pressed: true })).toBeInTheDocument();
    rerender(<ActionCard title="A" selected={false} />);
    expect(screen.getByRole('button', { pressed: false })).toBeInTheDocument();
  });

  it('is not a radio: no radio role, no radiogroup', () => {
    render(<ActionCard title="A" selected />);
    expect(screen.queryByRole('radio')).toBeNull();
  });

  it('selected wears the 1.5px brand ring; not selected has the plain hairline', () => {
    const { rerender } = render(<ActionCard title="A" selected />);
    expect(style(screen.getByRole('button'))).toContain('0 0 0 1.5px var(--border-brand)');
    rerender(<ActionCard title="A" selected={false} />);
    expect(style(screen.getByRole('button'))).toContain('0 0 0 1px var(--border-default)');
    expect(style(screen.getByRole('button'))).not.toContain('1.5px');
  });

  it('a consumer aria-pressed stands over the one derived from selected', () => {
    render(<ActionCard title="A" selected aria-pressed="mixed" />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'mixed');
  });
});

describe('ActionCard: keyboard focus', () => {
  it('a keyboard focus (:focus-visible) puts the DS focus ring on top of the ring, and blur takes it off', () => {
    // jsdom has no real focus-visible heuristic, so say that this focus is one.
    const matches = Element.prototype.matches;
    const spy = vi.spyOn(Element.prototype, 'matches').mockImplementation(function (this: Element, sel: string) {
      return sel === ':focus-visible' ? true : matches.call(this, sel);
    });
    render(<ActionCard title="A" />);
    const btn = screen.getByRole('button');
    expect(style(btn)).not.toContain('--focus-ring');
    act(() => btn.focus());
    expect(style(btn)).toContain('var(--focus-ring)');
    expect(style(btn)).toContain('0 0 0 1px var(--border-default)');
    act(() => btn.blur());
    expect(style(btn)).not.toContain('--focus-ring');
    spy.mockRestore();
  });

  it('a pointer focus (not :focus-visible) does not draw the ring', () => {
    render(<ActionCard title="A" />);
    const btn = screen.getByRole('button');
    const matches = Element.prototype.matches;
    const spy = vi.spyOn(Element.prototype, 'matches').mockImplementation(function (this: Element, sel: string) {
      return sel === ':focus-visible' ? false : matches.call(this, sel);
    });
    act(() => btn.focus());
    expect(style(btn)).not.toContain('--focus-ring');
    spy.mockRestore();
  });
});

describe('ActionCard: hover', () => {
  it('the ring goes to the brand color and the fill to a faint brand tint, and comes back', () => {
    render(<ActionCard title="A" />);
    const btn = screen.getByRole('button');
    expect(style(btn)).toContain('background: var(--bg-surface)');
    fireEvent.mouseEnter(btn);
    expect(style(btn)).toContain('0 0 0 1px var(--border-brand)');
    expect(style(btn)).toContain('background: color-mix(in srgb, var(--border-brand) 6%, var(--bg-surface))');
    fireEvent.mouseLeave(btn);
    expect(style(btn)).toContain('0 0 0 1px var(--border-default)');
    expect(style(btn)).toContain('background: var(--bg-surface)');
  });

  it('the hover fill is never the color of the icon tile, or the tile vanishes into the card (--bg-subtle and --interactive-ghost-hover are the same grey)', () => {
    render(<ActionCard title="A" icon={icon} />);
    const btn = screen.getByRole('button');
    const tile = screen.getByTestId('icon').parentElement as HTMLElement;
    fireEvent.mouseEnter(btn);
    expect(style(btn)).not.toContain('--interactive-ghost-hover');
    expect(style(btn)).not.toContain('background: var(--bg-subtle)');
    expect(style(tile)).toContain('background: var(--bg-subtle)');
  });

  it('the hover tint follows the variant: error tints toward the error color', () => {
    render(<ActionCard variant="error" title="A" />);
    fireEvent.mouseEnter(screen.getByRole('button'));
    expect(style(screen.getByRole('button'))).toContain('background: color-mix(in srgb, var(--status-error-dot) 6%, var(--bg-surface))');
  });

  it('a disabled card does not react to the pointer', () => {
    render(<ActionCard title="A" disabled />);
    const btn = screen.getByRole('button');
    fireEvent.mouseEnter(btn);
    expect(style(btn)).not.toContain('--border-brand');
    expect(style(btn)).toContain('background: var(--bg-surface)');
    expect(style(btn)).toContain('cursor: not-allowed');
  });

  it('pressing scales it down a little, and letting go puts it back', () => {
    render(<ActionCard title="A" />);
    const btn = screen.getByRole('button');
    fireEvent.mouseDown(btn);
    expect(style(btn)).toContain('transform: scale(var(--press-scale))');
    fireEvent.mouseUp(btn);
    expect(style(btn)).toContain('transform: none');
  });
});

describe('ActionCard: icon and trailing', () => {
  it('the icon sits in a tile hidden from a screen reader', () => {
    render(<ActionCard title="A" icon={icon} />);
    const tile = screen.getByTestId('icon').parentElement as HTMLElement;
    expect(tile).toHaveAttribute('aria-hidden', 'true');
    expect(style(tile)).toContain('width: 40px');
  });

  it('no icon, no tile', () => {
    const { container } = render(<ActionCard title="A" />);
    expect(container.querySelector('[style*="width: 40px"]')).toBeNull();
  });

  it('the arrow is there by default, and decorative', () => {
    const { container } = render(<ActionCard title="A" />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('trailing={null} takes the arrow away', () => {
    const { container } = render(<ActionCard title="A" trailing={null} />);
    expect(container.querySelector('svg')).toBeNull();
  });

  it('a custom trailing replaces the arrow, and a screen reader still reads it', () => {
    const { container } = render(<ActionCard title="Plano" trailing={<span>Novo</span>} />);
    expect(container.querySelector('svg')).toBeNull();
    expect(screen.getByRole('button', { name: 'Plano Novo' })).toBeInTheDocument();
  });

  it('no description, no second line (and no empty one left behind)', () => {
    render(<ActionCard title="Só o título" />);
    expect(screen.getByRole('button', { name: 'Só o título' })).toBeInTheDocument();
    expect(screen.getByText('Só o título').parentElement?.children).toHaveLength(1);
  });
});

describe('ActionCard: variants and disabled', () => {
  it('default: a quiet tile and the plain title', () => {
    render(<ActionCard title="A" icon={icon} />);
    const tile = screen.getByTestId('icon').parentElement as HTMLElement;
    expect(style(tile)).toContain('background: var(--bg-subtle)');
    expect(style(tile)).toContain('color: var(--text-secondary)');
    expect(style(screen.getByText('A'))).toContain('color: var(--text-primary)');
  });

  it('primary: a tile in the primary color, with its text color', () => {
    render(<ActionCard variant="primary" title="A" icon={icon} />);
    const tile = screen.getByTestId('icon').parentElement as HTMLElement;
    expect(style(tile)).toContain('background: var(--interactive-primary)');
    expect(style(tile)).toContain('color: var(--interactive-primary-fg)');
  });

  it('error: an error tile, an error title, and the error ring on hover and on selected', () => {
    render(<ActionCard variant="error" title="Cancelar" icon={icon} />);
    const btn = screen.getByRole('button');
    const tile = screen.getByTestId('icon').parentElement as HTMLElement;
    expect(style(tile)).toContain('background: var(--status-error-bg)');
    expect(style(tile)).toContain('color: var(--status-error-fg)');
    // the status text color, not --interactive-error: that one is under AA on the hover fill
    expect(style(screen.getByText('Cancelar'))).toContain('color: var(--status-error-fg)');
    expect(style(screen.getByText('Cancelar'))).not.toContain('--interactive-error');
    fireEvent.mouseEnter(btn);
    expect(style(btn)).toContain('0 0 0 1px var(--status-error-dot)');
  });

  it('error selected wears the error ring, not the brand one', () => {
    render(<ActionCard variant="error" title="A" selected />);
    expect(style(screen.getByRole('button'))).toContain('0 0 0 1.5px var(--status-error-dot)');
  });

  it('an unknown variant falls back to the default', () => {
    render(<ActionCard variant={'nope' as 'default'} title="A" icon={icon} />);
    expect(style(screen.getByTestId('icon').parentElement)).toContain('background: var(--bg-subtle)');
  });

  it('disabled: the title, the description and the tile go to the disabled colors, whatever the variant', () => {
    render(<ActionCard variant="error" title="Cancelar" description="Não dá mais" icon={icon} disabled />);
    expect(style(screen.getByText('Cancelar'))).toContain('color: var(--text-disabled)');
    expect(style(screen.getByText('Não dá mais'))).toContain('color: var(--text-disabled)');
    const tile = screen.getByTestId('icon').parentElement as HTMLElement;
    expect(style(tile)).toContain('background: var(--interactive-disabled-bg)');
    expect(style(tile)).toContain('color: var(--interactive-disabled-fg)');
  });

  it('not disabled, the description keeps the Typography color (an undefined color must not wipe it)', () => {
    render(<ActionCard title="A" description="Explicação" />);
    expect(style(screen.getByText('Explicação'))).toContain('color: var(--text-secondary)');
  });

  it('disabled and selected still shows the selection', () => {
    render(<ActionCard title="A" selected disabled />);
    expect(screen.getByRole('button', { pressed: true })).toBeDisabled();
    expect(style(screen.getByRole('button'))).toContain('1.5px var(--border-brand)');
  });
});
