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

/** A real pointer click carries detail >= 1; the Select ignores detail === 0
 *  (that's a <label>-forwarded or keyboard-synthesised click). */
const realClick = (el: Element) => fireEvent.click(el, { detail: 1 });

describe('Select (custom listbox)', () => {
  it('opens on a real click and portals the listbox to <body>, outside its own container', () => {
    const { container } = render(<Select label="Fruit" options={OPTS} />);
    realClick(screen.getByRole('combobox'));
    const listbox = screen.getByRole('listbox');
    expect(document.body).toContainElement(listbox);
    expect(container).not.toContainElement(listbox);
  });

  it('does NOT open when the click is forwarded from the field label (detail 0)', () => {
    render(<Select label="Fruit" options={OPTS} />);
    fireEvent.click(screen.getByRole('combobox')); // detail defaults to 0
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('selects an option, fires onValueChange and closes', () => {
    const onValueChange = vi.fn();
    render(<Select label="Fruit" options={OPTS} onValueChange={onValueChange} />);
    realClick(screen.getByRole('combobox'));
    fireEvent.click(within(screen.getByRole('listbox')).getByText('Banana'));
    expect(onValueChange).toHaveBeenCalledWith('b');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(screen.getByRole('combobox')).toHaveTextContent('Banana');
  });

  it('closes on an outside pointerdown', () => {
    render(<Select label="Fruit" options={OPTS} />);
    realClick(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('still opens from the keyboard (ArrowDown / Enter)', () => {
    render(<Select label="Fruit" options={OPTS} />);
    const trigger = screen.getByRole('combobox');
    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });
});
