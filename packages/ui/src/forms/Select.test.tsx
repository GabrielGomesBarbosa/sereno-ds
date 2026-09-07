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

  it('portals to <body> as an absolute (document-anchored, not fixed) node', () => {
    const { container } = render(<Select label="Fruit" options={OPTS} />);
    boxClick(screen.getByRole('combobox'));
    const listbox = screen.getByRole('listbox');
    expect(container).not.toContainElement(listbox); // out of the component subtree…
    expect(document.body).toContainElement(listbox); // …and into <body>
    // absolute + document coords rides page scroll for free — NOT position:fixed
    // (which would need per-frame JS repositioning and jitter).
    expect(listbox.style.position).toBe('absolute');
  });

  it('stays open on scroll while the field is glued, closes once the field moves', () => {
    render(<Select label="Fruit" options={OPTS} />);
    const trigger = screen.getByRole('combobox');
    boxClick(trigger);
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    // A scroll where the field hasn't moved (page scroll — the menu rides along)
    // must NOT dismiss it.
    fireEvent.scroll(document);
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    // Once the field shifts (an inner overflow container scrolled it out from
    // under the menu), the next scroll dismisses.
    const rect = { top: 480, bottom: 520, left: 0, right: 200, width: 200, height: 40, x: 0, y: 480, toJSON: () => ({}) } as DOMRect;
    const spy = vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue(rect);
    fireEvent.scroll(document);
    expect(screen.queryByRole('listbox')).toBeNull();
    spy.mockRestore();
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
