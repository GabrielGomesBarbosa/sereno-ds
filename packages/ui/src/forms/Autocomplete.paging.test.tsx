import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Autocomplete, type AutocompleteOption } from './Autocomplete';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const ROW = 36;
const VIEW = 288;
const many = (n: number, prefix = 'Item '): AutocompleteOption[] => Array.from({ length: n }, (_, i) => ({ value: prefix + i, label: prefix + i }));

// jsdom has no layout. These stand in for a list of 36px rows in a 288px window, which is all the
// reveal and the paging read: the height of the content, of the window, and where each row sits.
beforeEach(() => {
  const isList = (el: Element) => el.getAttribute('role') === 'listbox';
  const isOption = (el: Element) => el.getAttribute('role') === 'option';
  vi.spyOn(Element.prototype, 'scrollHeight', 'get').mockImplementation(function (this: Element) {
    return isList(this) ? this.querySelectorAll('[role=option]').length * ROW : 0;
  });
  vi.spyOn(Element.prototype, 'clientHeight', 'get').mockImplementation(function (this: Element) {
    return isList(this) ? VIEW : 0;
  });
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
    return isOption(this) ? ROW : 0;
  });
  vi.spyOn(HTMLElement.prototype, 'offsetTop', 'get').mockImplementation(function (this: HTMLElement) {
    return isOption(this) ? [...this.parentElement!.children].indexOf(this) * ROW : 0;
  });
});

const box = () => screen.getByRole('combobox') as HTMLInputElement;
const list = () => screen.getByRole('listbox') as HTMLUListElement;
const openByClick = () => {
  act(() => box().focus());
  fireEvent.click(box());
};
/** The user scrolls the list to `top`. */
const scrollTo = (top: number) => {
  list().scrollTop = top;
  fireEvent.scroll(list());
};

describe('Autocomplete: opens where the chosen row is', () => {
  const at = (strategy: 'inline' | 'fixed', opts: AutocompleteOption[], value: AutocompleteOption | null) => {
    const el = <Autocomplete label="Client" options={opts} value={value} />;
    return strategy === 'fixed' ? <div style={{ position: 'fixed', inset: 0 }}>{el}</div> : el;
  };

  it.each(['inline', 'fixed'] as const)('%s: the very first open scrolls the chosen row into view', (strategy) => {
    const opts = many(100);
    render(at(strategy, opts, opts[45]));
    openByClick();
    // row 45 sits at 1620..1656; the smallest scroll that shows it ends at its bottom edge
    expect(list().scrollTop).toBe(45 * ROW + ROW - VIEW);
  });

  it('a row that is already in view does not move the list', () => {
    const opts = many(100);
    render(at('inline', opts, opts[2]));
    openByClick();
    expect(list().scrollTop).toBe(0);
  });

  it('every open reveals it again', () => {
    const opts = many(100);
    render(at('inline', opts, opts[45]));
    openByClick();
    scrollTo(0);
    fireEvent.keyDown(box(), { key: 'Escape' });
    openByClick();
    expect(list().scrollTop).toBe(45 * ROW + ROW - VIEW);
  });

  it.each(['inline', 'fixed'] as const)('%s: pages that arrive under the user do not pull the list back', (strategy) => {
    const { rerender } = render(at(strategy, many(60), many(60)[45]));
    openByClick();
    scrollTo(2000); // the user is scrolling down for the next page
    rerender(at(strategy, many(110), many(110)[45]));
    rerender(at(strategy, many(160), many(160)[45]));
    expect(list().scrollTop).toBe(2000);
    expect(screen.getAllByRole('option')).toHaveLength(160);
  });

  it('a chosen row that is not loaded: no crash, and when it arrives it is marked but the list does not jump to it', () => {
    const value = { value: 'Item 80', label: 'Item 80' };
    const { rerender } = render(<Autocomplete label="Client" options={many(50)} value={value} />);
    openByClick();
    expect(box().value).toBe('Item 80');
    expect(list().scrollTop).toBe(0);
    rerender(<Autocomplete label="Client" options={many(100)} value={value} />);
    expect(list().scrollTop).toBe(0); // a user looking at the first rows is not carried away
    expect(screen.getByRole('option', { name: 'Item 80' })).toHaveAttribute('aria-selected', 'true');
  });

  it('typing starts the new list at the top', () => {
    // a server list: nothing is active after typing, so only the reset can put the list back at the top
    render(<Autocomplete label="Client" options={many(100)} filter={false} />);
    openByClick();
    scrollTo(900);
    fireEvent.change(box(), { target: { value: 'Item 1' } });
    expect(list().scrollTop).toBe(0);
  });

  it('the keyboard keeps the active row in view, inside the list', () => {
    render(<Autocomplete label="Client" options={many(100)} />);
    act(() => box().focus());
    fireEvent.keyDown(box(), { key: 'End' }); // closed: Home/End stay with the text
    fireEvent.keyDown(box(), { key: 'ArrowDown' });
    fireEvent.keyDown(box(), { key: 'End' });
    expect(list().scrollTop).toBe(100 * ROW - VIEW);
    fireEvent.keyDown(box(), { key: 'Home' });
    expect(list().scrollTop).toBe(0);
  });
});

describe('Autocomplete: onReachEnd', () => {
  // 50 rows = 1800px in a 288px window; "within five rows of the end" means 180px left or less.
  const NEAR = 1800 - VIEW - 5 * ROW;

  it('fires when the scroll gets within five rows of the end, not before', () => {
    const onReachEnd = vi.fn();
    render(<Autocomplete label="Client" options={many(50)} onReachEnd={onReachEnd} />);
    openByClick();
    expect(onReachEnd).not.toHaveBeenCalled();
    scrollTo(NEAR - 1);
    expect(onReachEnd).not.toHaveBeenCalled();
    scrollTo(NEAR);
    expect(onReachEnd).toHaveBeenCalledTimes(1);
  });

  it('fires once per list size: more scrolling at the end asks for nothing more', () => {
    const onReachEnd = vi.fn();
    render(<Autocomplete label="Client" options={many(50)} onReachEnd={onReachEnd} />);
    openByClick();
    scrollTo(NEAR);
    scrollTo(NEAR + 20);
    scrollTo(1800 - VIEW);
    expect(onReachEnd).toHaveBeenCalledTimes(1);
  });

  it('...and again once the list has grown and the user reaches the new end', () => {
    const onReachEnd = vi.fn();
    const { rerender } = render(<Autocomplete label="Client" options={many(50)} onReachEnd={onReachEnd} />);
    openByClick();
    scrollTo(NEAR);
    rerender(<Autocomplete label="Client" options={many(100)} onReachEnd={onReachEnd} />);
    expect(onReachEnd).toHaveBeenCalledTimes(1); // the new page is far below the window
    scrollTo(100 * ROW - VIEW - 5 * ROW);
    expect(onReachEnd).toHaveBeenCalledTimes(2);
  });

  it('a different list of the same size is a new list (a new search)', () => {
    const onReachEnd = vi.fn();
    const { rerender } = render(<Autocomplete label="Client" options={many(50)} onReachEnd={onReachEnd} />);
    openByClick();
    scrollTo(NEAR);
    rerender(<Autocomplete label="Client" options={many(50, 'Other ')} onReachEnd={onReachEnd} />);
    expect(onReachEnd).toHaveBeenCalledTimes(2);
  });

  it('never asks while loading, and asks when the wait is over if the user is still at the end', () => {
    const onReachEnd = vi.fn();
    const { rerender } = render(<Autocomplete label="Client" options={many(50)} loading onReachEnd={onReachEnd} />);
    openByClick();
    scrollTo(NEAR);
    expect(onReachEnd).not.toHaveBeenCalled();
    rerender(<Autocomplete label="Client" options={many(50)} onReachEnd={onReachEnd} />);
    expect(onReachEnd).toHaveBeenCalledTimes(1);
  });

  it('a list too short to scroll is already at its end: it asks as soon as it opens, once', () => {
    const onReachEnd = vi.fn();
    const { rerender } = render(<Autocomplete label="Client" options={many(3)} onReachEnd={onReachEnd} />);
    openByClick();
    expect(onReachEnd).toHaveBeenCalledTimes(1);
    rerender(<Autocomplete label="Client" options={many(3)} onReachEnd={onReachEnd} />);
    expect(onReachEnd).toHaveBeenCalledTimes(1);
  });

  it('a list with no next page passes no handler, and nothing is asked', () => {
    render(<Autocomplete label="Client" options={many(3)} />);
    expect(() => openByClick()).not.toThrow();
  });

  it('asks again on the next open', () => {
    const onReachEnd = vi.fn();
    render(<Autocomplete label="Client" options={many(3)} onReachEnd={onReachEnd} />);
    openByClick();
    fireEvent.keyDown(box(), { key: 'Escape' });
    openByClick();
    expect(onReachEnd).toHaveBeenCalledTimes(2);
  });

  it('does not ask while closed, or for an empty list', () => {
    const onReachEnd = vi.fn();
    const { rerender } = render(<Autocomplete label="Client" options={many(3)} onReachEnd={onReachEnd} />);
    expect(onReachEnd).not.toHaveBeenCalled();
    rerender(<Autocomplete label="Client" options={[]} onReachEnd={onReachEnd} />);
    openByClick();
    expect(onReachEnd).not.toHaveBeenCalled();
  });

  it('the newest handler is the one called', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = render(<Autocomplete label="Client" options={many(50)} onReachEnd={first} />);
    openByClick();
    rerender(<Autocomplete label="Client" options={many(50)} onReachEnd={second} />);
    scrollTo(NEAR);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});

// A list that loads when it opens, starting on the page around the chosen row: it opens empty, and the
// chosen row is among the rows that arrive.
describe('Autocomplete: a list that loads when it opens', () => {
  const win = many(50, 'Client ').map((o, i) => ({ ...o, value: 'c' + (950 + i), label: 'Client ' + (950 + i) }));
  const chosen = win[37]; // not in view at the top: row 37 sits at 1332..1368

  it('brings the chosen row into view and highlights it when the rows land', () => {
    const { rerender } = render(<Autocomplete label="Client" options={[]} loading value={chosen} />);
    openByClick();
    expect(box()).not.toHaveAttribute('aria-activedescendant');
    rerender(<Autocomplete label="Client" options={win} value={chosen} />);
    expect(list().scrollTop).toBe(37 * ROW + ROW - VIEW);
    expect(screen.getByRole('option', { name: 'Client 987' })).toHaveAttribute('aria-selected', 'true');
    expect(box().getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Client 987' }).id);
  });

  it('opened from the keyboard it does the same', () => {
    const { rerender } = render(<Autocomplete label="Client" options={[]} loading value={chosen} />);
    act(() => box().focus());
    fireEvent.keyDown(box(), { key: 'ArrowDown' });
    rerender(<Autocomplete label="Client" options={win} value={chosen} />);
    expect(list().scrollTop).toBe(37 * ROW + ROW - VIEW);
  });

  it('but not when the user has already scrolled the list away from the top', () => {
    // opened empty, so the chosen row stays the pending active one; a first page arrives without it...
    const { rerender } = render(<Autocomplete label="Client" options={[]} loading value={chosen} />);
    openByClick();
    rerender(<Autocomplete label="Client" options={win.slice(0, 20)} value={chosen} />);
    // ...the user pages down...
    scrollTo(300);
    // ...and the page with the chosen row lands: nobody is carried off to it
    rerender(<Autocomplete label="Client" options={win} value={chosen} />);
    expect(list().scrollTop).toBe(300);
  });

  it('a chosen row that is not in a list that already has rows is not chased', () => {
    const { rerender } = render(<Autocomplete label="Client" options={win.slice(0, 20)} value={chosen} />);
    openByClick();
    expect(box()).not.toHaveAttribute('aria-activedescendant');
    rerender(<Autocomplete label="Client" options={win} value={chosen} />);
    expect(list().scrollTop).toBe(0);
    expect(box()).not.toHaveAttribute('aria-activedescendant');
  });

  it('once the user moves the highlight, a row that lands later is not brought in', () => {
    const { rerender } = render(<Autocomplete label="Client" options={win.slice(0, 5)} value={chosen} />);
    openByClick();
    fireEvent.keyDown(box(), { key: 'ArrowDown' });
    rerender(<Autocomplete label="Client" options={win} value={chosen} />);
    expect(list().scrollTop).toBe(0);
  });
});

// The case the component exists for: 1000 records, pages of 50, the one being edited is on the
// last page. The app brings it in as the value, with its label, whatever page is loaded.
describe('Autocomplete: a thousand records, fifty at a time', () => {
  const ALL = many(1000, 'Client ');
  const page = (n: number) => ALL.slice(0, n * 50);

  it('the box shows the chosen client from the first moment, with only page one loaded', () => {
    render(<Autocomplete label="Client" options={page(1)} value={ALL[987]} />);
    expect(box().value).toBe('Client 987');
    openByClick();
    expect(screen.getAllByRole('option')).toHaveLength(50);
    expect(screen.queryAllByRole('option', { selected: true })).toHaveLength(0);
  });

  it('paging down loads page after page, and the chosen client is revealed when its page lands', () => {
    const onReachEnd = vi.fn();
    const { rerender } = render(<Autocomplete label="Client" options={page(1)} value={ALL[120]} onReachEnd={onReachEnd} />);
    openByClick();
    scrollTo(50 * ROW - VIEW);
    expect(onReachEnd).toHaveBeenCalledTimes(1);
    rerender(<Autocomplete label="Client" options={page(2)} value={ALL[120]} onReachEnd={onReachEnd} />);
    scrollTo(100 * ROW - VIEW);
    expect(onReachEnd).toHaveBeenCalledTimes(2);
    rerender(<Autocomplete label="Client" options={page(3)} value={ALL[120]} onReachEnd={onReachEnd} />);
    // client 120 is on page three; it arrived under a user who was already scrolling, so no jump
    expect(list().scrollTop).toBe(100 * ROW - VIEW);
    expect(screen.getByRole('option', { name: 'Client 120' })).toHaveAttribute('aria-selected', 'true');
  });
});
