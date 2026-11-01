import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Select } from './Select';

afterEach(cleanup);

const LONG = (n: number) => Array.from({ length: n }, (_, i) => ({ value: String(i), label: 'Item ' + i }));

/** A press that starts on the trigger, then the click - a real box click. */
const boxClick = (el: Element) => {
  fireEvent.pointerDown(el);
  fireEvent.click(el);
};

// `scrollIntoView` is the one thing the reveal does, and jsdom has no layout, so the spy records which
// option it was called on (by id) and the tests assert on that.
let calls: string[];
let args: unknown[];
let spy: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  calls = [];
  args = [];
  spy = vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(function (this: Element, arg?: boolean | ScrollIntoViewOptions) {
    calls.push(this.id);
    args.push(arg);
  });
});
afterEach(() => spy.mockRestore());

const asCoarse = <T,>(fn: () => T): T => {
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
    return fn();
  } finally {
    window.matchMedia = orig;
  }
};

describe('Select: opens on the selected option (SS-568)', () => {
  it('the very first open scrolls the selected option into view, not only the second', () => {
    render(<Select id="sel" label="Hora" options={LONG(48)} value="20" onValueChange={() => {}} />);
    boxClick(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(calls).toEqual(['sel-opt-20']);
    // the same minimal scroll the second open always had, so the option lands where it already did
    expect(args).toEqual([{ block: 'nearest' }]);
  });

  it('works the same inside a fixed container (the portalled strategy, a Dialog)', () => {
    render(
      <div style={{ position: 'fixed', inset: 0 }}>
        <Select id="sel" label="Hora" options={LONG(48)} value="20" onValueChange={() => {}} />
      </div>,
    );
    boxClick(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox').style.position).toBe('fixed');
    expect(calls).toEqual(['sel-opt-20']);
  });

  it('works on the touch sheet, as it always did', () => {
    asCoarse(() => {
      render(<Select id="sel" label="Hora" options={LONG(48)} value="20" onValueChange={() => {}} />);
      boxClick(screen.getByRole('combobox'));
      expect(calls).toEqual(['sel-opt-20']);
    });
  });

  it('every open reveals again: close, open, and it scrolls once more', () => {
    render(<Select id="sel" label="Hora" options={LONG(48)} value="20" onValueChange={() => {}} />);
    const trigger = screen.getByRole('combobox');
    boxClick(trigger);
    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).toBeNull();
    boxClick(trigger);
    expect(calls).toEqual(['sel-opt-20', 'sel-opt-20']);
  });

  it('with no value it starts on the first option and does not throw', () => {
    render(<Select id="sel" label="Hora" options={LONG(48)} />);
    boxClick(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(calls).toEqual(['sel-opt-0']);
  });

  it('opens from the keyboard on the selected option too', () => {
    render(<Select id="sel" label="Hora" options={LONG(48)} value="30" onValueChange={() => {}} />);
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(calls).toEqual(['sel-opt-30']);
  });
});

describe('Select: the keyboard still follows the active option', () => {
  it('ArrowDown and ArrowUp scroll each new active option into view', () => {
    render(<Select id="sel" label="Hora" options={LONG(48)} value="20" onValueChange={() => {}} />);
    const trigger = screen.getByRole('combobox');
    boxClick(trigger);
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    fireEvent.keyDown(trigger, { key: 'ArrowUp' });
    expect(calls).toEqual(['sel-opt-20', 'sel-opt-21', 'sel-opt-22', 'sel-opt-21']);
  });

  it('End and Home jump to the last and the first option', () => {
    render(<Select id="sel" label="Hora" options={LONG(48)} value="20" onValueChange={() => {}} />);
    const trigger = screen.getByRole('combobox');
    boxClick(trigger);
    fireEvent.keyDown(trigger, { key: 'End' });
    fireEvent.keyDown(trigger, { key: 'Home' });
    expect(calls).toEqual(['sel-opt-20', 'sel-opt-47', 'sel-opt-0']);
  });

  it('pointing at another option makes it the active one, and reveals it', () => {
    render(<Select id="sel" label="Hora" options={LONG(48)} value="20" onValueChange={() => {}} />);
    boxClick(screen.getByRole('combobox'));
    fireEvent.pointerEnter(screen.getByRole('option', { name: 'Item 25' }));
    expect(calls).toEqual(['sel-opt-20', 'sel-opt-25']);
  });
});

// The lists the app pages from the server: more options arrive while the menu is open, and the user
// may have scrolled the list to ask for them. Nothing the list does about that may pull it back.
describe('Select: options that arrive while it is open do not move the list', () => {
  const grow = (strategy: 'inline' | 'fixed') => {
    const el = (n: number) => {
      const select = <Select id="sel" label="Cidade" options={LONG(n)} value="3" onValueChange={() => {}} />;
      return strategy === 'fixed' ? <div style={{ position: 'fixed', inset: 0 }}>{select}</div> : select;
    };
    return el;
  };

  it.each(['inline', 'fixed'] as const)('%s: a page loaded under the user does not scroll back to the selected option', (strategy) => {
    const el = grow(strategy);
    const { rerender } = render(el(20));
    boxClick(screen.getByRole('combobox'));
    expect(calls).toEqual(['sel-opt-3']);

    // the user scrolls down the list to ask for the next page...
    const listbox = screen.getByRole('listbox');
    listbox.scrollTop = 480;
    // ...and the pages arrive, one after the other
    rerender(el(40));
    rerender(el(60));
    rerender(el(80));

    expect(calls).toEqual(['sel-opt-3']); // no second scroll, from any of the three pages
    expect(listbox.scrollTop).toBe(480);
    expect(screen.getAllByRole('option')).toHaveLength(80);
  });

  it.each(['inline', 'fixed'] as const)('%s: the keyboard still works on the pages that arrived', (strategy) => {
    const el = grow(strategy);
    const { rerender } = render(el(20));
    const trigger = screen.getByRole('combobox');
    boxClick(trigger);
    rerender(el(40));
    fireEvent.keyDown(trigger, { key: 'End' });
    expect(calls).toEqual(['sel-opt-3', 'sel-opt-39']);
  });

  it('a value that is not among the loaded options yet: no crash, no scroll, and the trigger keeps its placeholder', () => {
    const { rerender } = render(<Select id="sel" label="Cidade" placeholder="Escolher" options={LONG(20)} value="not-loaded" onValueChange={() => {}} />);
    boxClick(screen.getByRole('combobox'));
    expect(screen.getByRole('combobox')).toHaveTextContent('Escolher');
    expect(calls).toEqual(['sel-opt-0']); // the first enabled one is active
    rerender(<Select id="sel" label="Cidade" placeholder="Escolher" options={[...LONG(20), { value: 'not-loaded', label: 'Lisbon' }]} value="not-loaded" onValueChange={() => {}} />);
    expect(screen.getByRole('combobox')).toHaveTextContent('Lisbon'); // once it arrives, the label shows
    expect(calls).toEqual(['sel-opt-0']); // and the list was not moved under the user
  });

  it('closing and opening again, with more options by then, reveals the selected one once more', () => {
    const el = grow('inline');
    const { rerender } = render(el(20));
    const trigger = screen.getByRole('combobox');
    boxClick(trigger);
    rerender(el(40));
    fireEvent.keyDown(trigger, { key: 'Escape' });
    boxClick(trigger);
    expect(calls).toEqual(['sel-opt-3', 'sel-opt-3']);
  });

  it('options that shrink under an open list do not throw', () => {
    const el = grow('inline');
    const { rerender } = render(el(20));
    boxClick(screen.getByRole('combobox'));
    expect(() => rerender(el(2))).not.toThrow();
    expect(screen.getAllByRole('option')).toHaveLength(2);
  });
});
