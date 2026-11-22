import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Dialog } from './Dialog';
import { Select } from '../forms/Select';
import { Autocomplete } from '../forms/Autocomplete';
import { DatePicker } from '../forms/DatePicker';
import { DateTimePicker } from '../forms/DateTimePicker';
import { SearchInput } from '../forms/SearchInput';
import { Menu } from '../core/Menu';

afterEach(cleanup);

/**
 * Esc and nested popups (SS-571, SS-573). Inside a Dialog, the first Esc closes the popup that is open
 * and the Dialog stays; the next one closes the Dialog. One case per component that handles Esc: each
 * opens its popup, presses Esc on the element that has the focus, and says where the popup is.
 */
const OPTS = [
  { value: 'a', label: 'Apple' },
  { value: 'b', label: 'Banana' },
];

interface Case {
  name: string;
  field: React.ReactNode;
  /** Opens the popup and returns the element that receives the key (the one with the focus). */
  open: () => HTMLElement;
  /** True while the popup is on screen. */
  isOpen: () => boolean;
}

const cases: Case[] = [
  {
    name: 'Select',
    field: <Select label="Fruit" options={OPTS} />,
    open: () => {
      const t = screen.getByRole('combobox');
      fireEvent.pointerDown(t);
      fireEvent.click(t);
      return t;
    },
    isOpen: () => !!screen.queryByRole('listbox'),
  },
  {
    name: 'Autocomplete',
    field: <Autocomplete label="City" options={OPTS} />,
    open: () => {
      const t = screen.getByRole('combobox');
      act(() => t.focus());
      fireEvent.click(t);
      return t;
    },
    isOpen: () => !!screen.queryByRole('listbox'),
  },
  {
    name: 'DatePicker',
    field: <DatePicker label="Date" defaultValue="2026-10-12" />,
    open: () => {
      fireEvent.click(screen.getByRole('button', { name: 'Date' }));
      return screen.getByRole('dialog', { name: 'Date' });
    },
    isOpen: () => !!screen.queryByRole('dialog', { name: 'Date' }),
  },
  {
    name: 'DateTimePicker (month and year popover)',
    field: <DateTimePicker year={2026} month={9} />,
    open: () => {
      const title = document.querySelector<HTMLButtonElement>('.sereno-dtp-title[aria-haspopup]')!;
      fireEvent.click(title);
      return document.querySelector<HTMLElement>('.sereno-dtp-pop')!;
    },
    isOpen: () => !!document.querySelector('.sereno-dtp-pop'),
  },
  {
    name: 'Menu',
    field: <Menu trigger={<button type="button">Open</button>} items={[{ label: 'One', onClick: () => {} }]} />,
    open: () => {
      fireEvent.click(screen.getByText('Open'));
      return screen.getByRole('menu');
    },
    isOpen: () => !!screen.queryByRole('menu'),
  },
];

function inDialog(field: React.ReactNode, onClose: () => void) {
  return render(
    <Dialog open onClose={onClose}>
      <Dialog.Body>{field}</Dialog.Body>
    </Dialog>,
  );
}

describe('Dialog: Esc closes the popup first, the Dialog on the next press', () => {
  for (const c of cases) {
    it(c.name, () => {
      const onClose = vi.fn();
      inDialog(c.field, onClose);
      const target = c.open();
      expect(c.isOpen()).toBe(true);

      fireEvent.keyDown(target, { key: 'Escape' });
      expect(c.isOpen()).toBe(false);
      expect(onClose).not.toHaveBeenCalled();

      fireEvent.keyDown(document.body, { key: 'Escape' }); // nothing is open now
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  }

  it('SearchInput: Esc clears the text first, the Dialog gets the next one', () => {
    const onClose = vi.fn();
    inDialog(<SearchInput aria-label="Search" defaultValue="abc" />, onClose);
    const box = screen.getByRole('searchbox') as HTMLInputElement;
    fireEvent.keyDown(box, { key: 'Escape' });
    expect(box.value).toBe('');
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.keyDown(box, { key: 'Escape' }); // empty: nothing to clear
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Esc with no popup open still reaches the Dialog', () => {
    const onClose = vi.fn();
    inDialog(<Select label="Fruit" options={OPTS} />, onClose);
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('a Dialog that is not dismissible ignores Esc either way', () => {
    const onClose = vi.fn();
    render(
      <Dialog open dismissible={false} onClose={onClose}>
        <Dialog.Body>
          <Select label="Fruit" options={OPTS} />
        </Dialog.Body>
      </Dialog>,
    );
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });
});
