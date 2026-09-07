import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { Select } from './Select';

afterEach(cleanup);

const OPTS = [
  { value: 'a', label: 'Apple' },
  { value: 'b', label: 'Banana' },
  { value: 'c', label: 'Cherry' },
];

/** A press that starts on the trigger, then the click — a real box click. */
const boxClick = (el: Element) => {
  fireEvent.pointerDown(el);
  fireEvent.click(el);
};

describe('Select (custom listbox)', () => {
  it('opens on a box click', () => {
    render(<Select label="Fruit" options={OPTS} />);
    boxClick(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('does NOT open when the click is forwarded from the field label', () => {
    render(<Select label="Fruit" options={OPTS} />);
    const label = document.querySelector<HTMLLabelElement>('label[for]')!;
    const trigger = screen.getByRole('combobox');
    // Real label activation: the press lands on the <label>, then the browser
    // forwards a trusted click (detail 1) to the associated control.
    fireEvent.pointerDown(label);
    fireEvent.mouseDown(label);
    fireEvent.click(trigger, { detail: 1 });
    expect(screen.queryByRole('listbox')).toBeNull();
    // ...and a bare forwarded click (no pointerdown anywhere) is also inert.
    fireEvent.click(trigger);
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('is an in-place absolute child (not portalled) when not inside a fixed container', () => {
    const { container } = render(<Select label="Fruit" options={OPTS} />);
    boxClick(screen.getByRole('combobox'));
    const listbox = screen.getByRole('listbox');
    expect(container).toContainElement(listbox); // rendered in place…
    expect(listbox.style.position).toBe('absolute'); // …glued to the field by the browser
  });

  it('never closes on scroll in the inline case — the browser keeps it glued', () => {
    render(
      <div data-testid="scroller" style={{ overflowY: 'auto' }}>
        <Select label="Fruit" options={OPTS} />
      </div>,
    );
    boxClick(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.scroll(document);
    fireEvent.scroll(screen.getByTestId('scroller'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('portals to <body> as position:fixed when the field is inside a fixed container', () => {
    const { container } = render(
      <div style={{ position: 'fixed', inset: 0 }}>
        <Select label="Fruit" options={OPTS} />
      </div>,
    );
    boxClick(screen.getByRole('combobox'));
    const listbox = screen.getByRole('listbox');
    expect(container).not.toContainElement(listbox);
    expect(document.body).toContainElement(listbox);
    expect(listbox.style.position).toBe('fixed');
  });

  it('selects an option, fires onValueChange and closes', () => {
    const onValueChange = vi.fn();
    render(<Select label="Fruit" options={OPTS} onValueChange={onValueChange} />);
    boxClick(screen.getByRole('combobox'));
    fireEvent.click(within(screen.getByRole('listbox')).getByText('Banana'));
    expect(onValueChange).toHaveBeenCalledWith('b');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(screen.getByRole('combobox')).toHaveTextContent('Banana');
  });

  it('closes on an outside pointerdown', () => {
    render(<Select label="Fruit" options={OPTS} />);
    boxClick(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('still opens from the keyboard (ArrowDown), with no pointer press', () => {
    render(<Select label="Fruit" options={OPTS} />);
    const trigger = screen.getByRole('combobox');
    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('opens as a bottom sheet on a coarse pointer', () => {
    const orig = window.matchMedia;
    window.matchMedia = ((q: string) => ({
      matches: q.includes('coarse'),
      media: q,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;
    try {
      const onValueChange = vi.fn();
      render(<Select label="Fruit" options={OPTS} onValueChange={onValueChange} />);
      boxClick(screen.getByRole('combobox'));
      const listbox = screen.getByRole('listbox');
      expect(document.body).toContainElement(listbox); // portalled
      const scrim = listbox.parentElement as HTMLElement;
      expect(scrim).toHaveAttribute('role', 'presentation'); // full-screen scrim, not an anchored dropdown
      expect(listbox.style.width).toBe('100%');
      expect(listbox.style.overscrollBehavior).toBe('contain'); // list scroll doesn't chain to the page
      // page scroll is locked behind the sheet
      expect(document.body.style.overflow).toBe('hidden');
      expect(document.documentElement.style.overflow).toBe('hidden');
      // tapping a row selects and closes — and restores the page scroll
      fireEvent.click(within(listbox).getByText('Cherry'));
      expect(onValueChange).toHaveBeenCalledWith('c');
      expect(screen.queryByRole('listbox')).toBeNull();
      expect(document.body.style.overflow).toBe('');
    } finally {
      window.matchMedia = orig;
    }
  });

  it('opens without error nested in an overflow container, and caps its height', () => {
    render(
      <div style={{ height: 140, overflowY: 'auto' }}>
        <div style={{ height: 400 }} />
        <Select label="Fruit" options={OPTS} />
      </div>,
    );
    boxClick(screen.getByRole('combobox'));
    const listbox = screen.getByRole('listbox');
    expect(listbox).toBeInTheDocument();
    // clip-aware placement resolves maxHeight to a concrete px value.
    expect(listbox.style.maxHeight).toMatch(/^\d+px$/);
  });
});
