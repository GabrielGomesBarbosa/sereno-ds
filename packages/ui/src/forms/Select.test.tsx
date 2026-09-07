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
  it('opens on a box click and portals the listbox to <body>, outside its own container', () => {
    const { container } = render(<Select label="Fruit" options={OPTS} />);
    boxClick(screen.getByRole('combobox'));
    const listbox = screen.getByRole('listbox');
    expect(document.body).toContainElement(listbox);
    expect(container).not.toContainElement(listbox);
  });

  it('does NOT open when the click is forwarded from the field label (no press on the box)', () => {
    render(<Select label="Fruit" options={OPTS} />);
    // A <label htmlFor> click forwards a click to the button with no pointerdown on it.
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.queryByRole('listbox')).toBeNull();
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

  it('closes when the page scrolls (but not when the list itself scrolls)', () => {
    render(<Select label="Fruit" options={OPTS} />);
    boxClick(screen.getByRole('combobox'));
    const listbox = screen.getByRole('listbox');
    // the list's own scroll is ignored
    fireEvent.scroll(listbox);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    // scrolling anything else dismisses it
    fireEvent.scroll(document);
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('still opens from the keyboard (ArrowDown), with no pointer press', () => {
    render(<Select label="Fruit" options={OPTS} />);
    const trigger = screen.getByRole('combobox');
    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });
});
