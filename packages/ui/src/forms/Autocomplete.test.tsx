import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Autocomplete, type AutocompleteOption } from './Autocomplete';
import { Dialog } from '../feedback/Dialog';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const OPTS: AutocompleteOption[] = [
  { value: 'a', label: 'Apple' },
  { value: 'b', label: 'Banana' },
  { value: 'c', label: 'Cherry' },
];
const CITIES: AutocompleteOption[] = [
  { value: 'sp', label: 'São Paulo' },
  { value: 'rj', label: 'Rio de Janeiro' },
  { value: 'ssa', label: 'Salvador' },
  { value: 'cwb', label: 'Curitiba' },
];

const box = () => screen.getByRole('combobox') as HTMLInputElement;
const typeIn = (text: string) => fireEvent.change(box(), { target: { value: text } });
const key = (k: string, init: KeyboardEventInit = {}) => fireEvent.keyDown(box(), { key: k, ...init });
const options = () => screen.queryAllByRole('option').map((o) => o.textContent);
/** Focus the box the way a user does, then click it open. */
const openByClick = () => {
  act(() => box().focus());
  fireEvent.click(box());
};
/** The visible status row (the live region repeats its text for a screen reader, so the text alone is not unique). */
const statusRow = (text: string) => screen.queryAllByText(text).find((el) => el.getAttribute('role') !== 'status') ?? null;
/** The spinner of the loading state: the one thing drawn in the popup besides the rows (it has no text). */
const spinner = () => screen.getByRole('listbox').parentElement!.querySelector('[aria-hidden="true"] > span');
const activeLabel = () => {
  const id = box().getAttribute('aria-activedescendant');
  return id ? document.getElementById(id)?.textContent : null;
};

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

describe('Autocomplete: the field', () => {
  it('is a combobox text box named by its label, closed at first', () => {
    render(<Autocomplete label="Fruit" options={OPTS} />);
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    expect(input.tagName).toBe('INPUT');
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
    expect(input).toHaveAttribute('aria-haspopup', 'listbox');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).not.toHaveAttribute('aria-controls');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('opens on a click and points aria-controls at the list', () => {
    render(<Autocomplete label="Fruit" options={OPTS} />);
    openByClick();
    const list = screen.getByRole('listbox');
    expect(box()).toHaveAttribute('aria-expanded', 'true');
    expect(box()).toHaveAttribute('aria-controls', list.id);
    expect(options()).toEqual(['Apple', 'Banana', 'Cherry']);
  });

  it('asks the browser and the password managers to leave it alone', () => {
    render(<Autocomplete label="Fruit" options={OPTS} />);
    expect(box()).toHaveAttribute('autocomplete', 'off');
    expect(box()).toHaveAttribute('data-1p-ignore');
    expect(box()).toHaveAttribute('data-lpignore', 'true');
    expect(box()).toHaveAttribute('data-bwignore', 'true');
  });

  it('shares the Field contract: hint, error and required reach the text box', () => {
    const { rerender } = render(<Autocomplete label="Fruit" hint="Pick one" required options={OPTS} />);
    expect(box()).toHaveAccessibleDescription('Pick one');
    expect(box()).toHaveAttribute('aria-required', 'true');
    rerender(<Autocomplete label="Fruit" error="Required" options={OPTS} />);
    expect(box()).toHaveAttribute('aria-invalid', 'true');
    expect(box()).toHaveAccessibleDescription('Required');
  });

  it('takes an aria-label when there is no visible label', () => {
    render(<Autocomplete aria-label="Client" options={OPTS} />);
    expect(screen.getByRole('combobox', { name: 'Client' })).toBeInTheDocument();
  });

  it('mirrors the chosen value to a hidden input when it has a name', () => {
    const { container, rerender } = render(<Autocomplete label="Fruit" name="fruit" options={OPTS} value={null} />);
    const hidden = container.querySelector<HTMLInputElement>('input[type=hidden][name=fruit]')!;
    expect(hidden.value).toBe('');
    rerender(<Autocomplete label="Fruit" name="fruit" options={OPTS} value={OPTS[1]} />);
    expect(hidden.value).toBe('b');
  });

  it('renders no hidden input without a name', () => {
    const { container } = render(<Autocomplete label="Fruit" options={OPTS} />);
    expect(container.querySelector('input[type=hidden]')).toBeNull();
  });

  it('forwards its ref to the hidden input', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Autocomplete ref={ref} label="Fruit" name="fruit" options={OPTS} defaultValue={OPTS[0]} />);
    expect(ref.current).toHaveAttribute('type', 'hidden');
    expect(ref.current!.value).toBe('a');
  });

  it('disabled: no opening, no typing, no clear', () => {
    render(<Autocomplete label="Fruit" options={OPTS} defaultValue={OPTS[0]} disabled />);
    expect(box()).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Limpar seleção' })).toBeNull();
    fireEvent.click(box());
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('speaks pt-BR by default, English on request, and any text can be overridden', () => {
    const { unmount } = render(<Autocomplete label="Fruit" options={[]} />);
    expect(box()).toHaveAttribute('placeholder', 'Buscar…');
    openByClick();
    expect(screen.getByRole('status')).toHaveTextContent('Nenhum resultado');
    unmount();

    const { unmount: un2 } = render(<Autocomplete label="Fruit" options={[]} locale="en" />);
    expect(box()).toHaveAttribute('placeholder', 'Search…');
    openByClick();
    expect(screen.getByRole('status')).toHaveTextContent('No results');
    un2();

    render(<Autocomplete label="Fruit" options={[]} placeholder="Escolha" labels={{ empty: 'Nada por aqui' }} />);
    expect(box()).toHaveAttribute('placeholder', 'Escolha');
    openByClick();
    expect(screen.getByRole('status')).toHaveTextContent('Nada por aqui');
  });
});

describe('Autocomplete: the value carries its own label', () => {
  it('shows value.label in the box even when no option matches it', () => {
    render(<Autocomplete label="City" options={OPTS} value={{ value: 'zrh', label: 'Zurich' }} />);
    expect(box().value).toBe('Zurich');
    openByClick();
    expect(options()).toEqual(['Apple', 'Banana', 'Cherry']); // the list is only what `options` says
    expect(screen.queryAllByRole('option', { selected: true })).toHaveLength(0);
  });

  it('keeps the label when the options change under it (the page it came from is gone)', () => {
    const value = { value: 'b', label: 'Banana' };
    const { rerender } = render(<Autocomplete label="Fruit" options={OPTS} value={value} />);
    rerender(<Autocomplete label="Fruit" options={[{ value: 'z', label: 'Zucchini' }]} value={value} />);
    expect(box().value).toBe('Banana');
  });

  it('uncontrolled: choosing sets the value, gives back the option itself and closes the list', () => {
    const onValueChange = vi.fn();
    render(<Autocomplete label="Fruit" options={OPTS} onValueChange={onValueChange} />);
    openByClick();
    fireEvent.click(screen.getByRole('option', { name: 'Banana' }));
    expect(onValueChange).toHaveBeenCalledWith(OPTS[1]);
    expect(box().value).toBe('Banana');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(document.activeElement).toBe(box());
  });

  it('controlled: the box follows `value`, and a parent that ignores the choice keeps the old one', () => {
    const onValueChange = vi.fn();
    render(<Autocomplete label="Fruit" options={OPTS} value={OPTS[0]} onValueChange={onValueChange} />);
    openByClick();
    fireEvent.click(screen.getByRole('option', { name: 'Cherry' }));
    expect(onValueChange).toHaveBeenCalledWith(OPTS[2]);
    act(() => box().blur());
    expect(box().value).toBe('Apple');
  });

  it('marks the chosen row as selected', () => {
    render(<Autocomplete label="Fruit" options={OPTS} defaultValue={OPTS[1]} />);
    openByClick();
    expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: 'Apple' })).toHaveAttribute('aria-selected', 'false');
  });

  it('opening with a value shows the whole list, not only the row that matches the box', () => {
    render(<Autocomplete label="Fruit" options={OPTS} defaultValue={OPTS[1]} />);
    openByClick();
    expect(options()).toEqual(['Apple', 'Banana', 'Cherry']);
    expect(activeLabel()).toBe('Banana'); // and it starts on the chosen row
  });

  it('a disabled row cannot be chosen', () => {
    const onValueChange = vi.fn();
    render(
      <Autocomplete
        label="Plan"
        onValueChange={onValueChange}
        options={[
          { value: 'free', label: 'Free' },
          { value: 'pro', label: 'Pro', disabled: true },
        ]}
      />,
    );
    openByClick();
    fireEvent.click(screen.getByRole('option', { name: 'Pro' }));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });
});

describe('Autocomplete: filtering as you type', () => {
  it('typing opens the list and narrows it, ignoring case and accents', () => {
    render(<Autocomplete label="City" options={CITIES} />);
    act(() => box().focus());
    typeIn('SAO');
    expect(options()).toEqual(['São Paulo']);
    typeIn('sal');
    expect(options()).toEqual(['Salvador']);
    typeIn('a'); // matches anywhere in the label
    expect(options()).toEqual(['São Paulo', 'Rio de Janeiro', 'Salvador', 'Curitiba']);
  });

  it('the first match is ready for Enter', () => {
    const onValueChange = vi.fn();
    render(<Autocomplete label="City" options={CITIES} onValueChange={onValueChange} />);
    act(() => box().focus());
    typeIn('sa');
    expect(activeLabel()).toBe('São Paulo');
    key('Enter');
    expect(onValueChange).toHaveBeenCalledWith(CITIES[0]);
  });

  it('nothing matching shows the empty row and Enter picks nothing', () => {
    const onValueChange = vi.fn();
    render(<Autocomplete label="City" options={CITIES} onValueChange={onValueChange} />);
    act(() => box().focus());
    typeIn('zzz');
    expect(options()).toEqual([]);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(statusRow('Nenhum resultado')).toBeInTheDocument();
    key('Enter');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('a custom filter decides per row', () => {
    render(<Autocomplete label="City" options={CITIES} filter={(o, q) => o.value.startsWith(q)} />);
    act(() => box().focus());
    typeIn('s');
    expect(options()).toEqual(['São Paulo', 'Salvador']);
  });

  it('filter={false} leaves the list to the server: typing changes nothing and nothing is active', () => {
    const onValueChange = vi.fn();
    render(<Autocomplete label="City" options={CITIES} filter={false} onValueChange={onValueChange} />);
    act(() => box().focus());
    typeIn('zzz');
    expect(options()).toHaveLength(4);
    expect(box()).not.toHaveAttribute('aria-activedescendant');
    key('Enter'); // would pick a row of the answer that has not arrived yet
    expect(onValueChange).not.toHaveBeenCalled();
    key('ArrowDown');
    key('Enter');
    expect(onValueChange).toHaveBeenCalledWith(CITIES[0]);
  });

  it('never turns what was typed into the value', () => {
    const onValueChange = vi.fn();
    render(<Autocomplete label="City" options={CITIES} onValueChange={onValueChange} />);
    act(() => box().focus());
    typeIn('Lisbon');
    act(() => box().blur());
    expect(onValueChange).not.toHaveBeenCalled();
    expect(box().value).toBe('');
  });
});

describe('Autocomplete: onSearch', () => {
  beforeEach(() => vi.useFakeTimers());

  it('is debounced while typing: only the last text goes out', () => {
    const onSearch = vi.fn();
    render(<Autocomplete label="City" options={CITIES} filter={false} onSearch={onSearch} debounce={200} />);
    act(() => box().focus());
    typeIn('s');
    typeIn('sa');
    typeIn('sal');
    act(() => void vi.advanceTimersByTime(199));
    expect(onSearch).not.toHaveBeenCalled();
    act(() => void vi.advanceTimersByTime(1));
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith('sal');
  });

  it('is not told about the chosen label: opening, looking and leaving say nothing', () => {
    const onSearch = vi.fn();
    render(<Autocomplete label="City" options={CITIES} defaultValue={CITIES[0]} onSearch={onSearch} />);
    openByClick();
    act(() => box().blur());
    act(() => void vi.advanceTimersByTime(1000));
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('goes back to "" when a row is chosen, so the app can reload the whole list', () => {
    const onSearch = vi.fn();
    render(<Autocomplete label="City" options={CITIES} filter={false} onSearch={onSearch} debounce={50} />);
    act(() => box().focus());
    typeIn('sal');
    act(() => void vi.advanceTimersByTime(50));
    fireEvent.click(screen.getByRole('option', { name: 'Salvador' }));
    expect(onSearch.mock.calls).toEqual([['sal'], ['']]);
    // and only once: the query is already empty
    openByClick();
    act(() => box().blur());
    expect(onSearch).toHaveBeenCalledTimes(2);
  });

  it('goes back to "" when the box is left, or Esc closes the list', () => {
    const onSearch = vi.fn();
    render(<Autocomplete label="City" options={CITIES} filter={false} onSearch={onSearch} debounce={50} />);
    act(() => box().focus());
    typeIn('sal');
    act(() => void vi.advanceTimersByTime(50));
    key('Escape');
    expect(onSearch.mock.calls).toEqual([['sal'], ['']]);
    typeIn('rio');
    act(() => void vi.advanceTimersByTime(50));
    act(() => box().blur());
    expect(onSearch.mock.calls).toEqual([['sal'], [''], ['rio'], ['']]);
  });

  it('a pending search is dropped when the box settles before it fires', () => {
    const onSearch = vi.fn();
    render(<Autocomplete label="City" options={CITIES} filter={false} onSearch={onSearch} debounce={300} />);
    act(() => box().focus());
    typeIn('sal');
    act(() => box().blur());
    act(() => void vi.advanceTimersByTime(1000));
    expect(onSearch).not.toHaveBeenCalled(); // "sal" never went out, and "" was already the query
  });

  it('works without an onSearch', () => {
    render(<Autocomplete label="City" options={CITIES} />);
    act(() => box().focus());
    typeIn('sal');
    expect(() => act(() => void vi.advanceTimersByTime(1000))).not.toThrow();
  });
});

describe('Autocomplete: leaving, Esc and clearing', () => {
  it('leaving the box puts the chosen label back and closes the list', () => {
    render(<Autocomplete label="City" options={CITIES} defaultValue={CITIES[0]} />);
    act(() => box().focus());
    typeIn('rio');
    expect(box().value).toBe('rio');
    act(() => box().blur());
    expect(box().value).toBe('São Paulo');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('Esc closes the list and drops the typed text', () => {
    render(<Autocomplete label="City" options={CITIES} defaultValue={CITIES[0]} />);
    act(() => box().focus());
    typeIn('rio');
    key('Escape');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(box().value).toBe('São Paulo');
  });

  it('Esc with the list open does not reach a Dialog around it; the next Esc does', () => {
    const onClose = vi.fn();
    render(
      <Dialog open onClose={onClose}>
        <Dialog.Body>
          <Autocomplete label="City" options={CITIES} />
        </Dialog.Body>
      </Dialog>,
    );
    openByClick();
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    key('Escape');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(onClose).not.toHaveBeenCalled();
    key('Escape'); // nothing open now: the Dialog gets its Esc
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('a press outside closes the list and restores the label', () => {
    render(
      <div>
        <Autocomplete label="City" options={CITIES} defaultValue={CITIES[0]} />
        <p>elsewhere</p>
      </div>,
    );
    act(() => box().focus());
    typeIn('rio');
    fireEvent.pointerDown(screen.getByText('elsewhere'));
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(box().value).toBe('São Paulo');
  });

  it('a press inside the list keeps it open and keeps the focus in the box', () => {
    render(<Autocomplete label="City" options={CITIES} />);
    openByClick();
    const list = screen.getByRole('listbox');
    fireEvent.pointerDown(list);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    // the press must not take the focus off the text box
    expect(fireEvent.mouseDown(list)).toBe(false); // preventDefault was called
  });

  it('emptying the box clears the value', () => {
    const onValueChange = vi.fn();
    render(<Autocomplete label="City" options={CITIES} defaultValue={CITIES[0]} onValueChange={onValueChange} />);
    act(() => box().focus());
    typeIn('');
    expect(onValueChange).toHaveBeenCalledWith(null);
  });

  it('...unless it is not clearable: then leaving puts the label back', () => {
    const onValueChange = vi.fn();
    render(<Autocomplete label="City" clearable={false} options={CITIES} defaultValue={CITIES[0]} onValueChange={onValueChange} />);
    act(() => box().focus());
    typeIn('');
    act(() => box().blur());
    expect(onValueChange).not.toHaveBeenCalled();
    expect(box().value).toBe('São Paulo');
    expect(screen.queryByRole('button', { name: 'Limpar seleção' })).toBeNull();
  });

  it('the × clears the value, empties the box and keeps the focus there', () => {
    const onValueChange = vi.fn();
    render(<Autocomplete label="City" options={CITIES} defaultValue={CITIES[0]} onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Limpar seleção' }));
    expect(onValueChange).toHaveBeenCalledWith(null);
    expect(box().value).toBe('');
    expect(document.activeElement).toBe(box());
    expect(screen.queryByRole('button', { name: 'Limpar seleção' })).toBeNull();
  });

  it('the × is not in the tab order, and the chevron toggles the list', () => {
    render(<Autocomplete label="City" options={CITIES} defaultValue={CITIES[0]} />);
    expect(screen.getByRole('button', { name: 'Limpar seleção' })).toHaveAttribute('tabindex', '-1');
    const chevron = screen.getByRole('button', { name: 'Abrir lista' });
    expect(chevron).toHaveAttribute('tabindex', '-1');
    fireEvent.click(chevron);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Fechar lista' }));
    expect(screen.queryByRole('listbox')).toBeNull();
  });
});

describe('Autocomplete: keyboard', () => {
  it('ArrowDown opens the list on the chosen row, or on the first one', () => {
    const { unmount } = render(<Autocomplete label="Fruit" options={OPTS} defaultValue={OPTS[1]} />);
    act(() => box().focus());
    key('ArrowDown');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(activeLabel()).toBe('Banana');
    unmount();
    render(<Autocomplete label="Fruit" options={OPTS} />);
    act(() => box().focus());
    key('ArrowUp');
    expect(activeLabel()).toBe('Apple');
  });

  it('arrows move the active row and stop at the ends; Home and End jump', () => {
    render(<Autocomplete label="Fruit" options={OPTS} />);
    act(() => box().focus());
    key('ArrowDown');
    key('ArrowDown');
    expect(activeLabel()).toBe('Banana');
    key('ArrowDown');
    key('ArrowDown'); // already on the last: a wall, not a loop
    expect(activeLabel()).toBe('Cherry');
    key('Home');
    expect(activeLabel()).toBe('Apple');
    key('ArrowUp');
    expect(activeLabel()).toBe('Apple');
    key('End');
    expect(activeLabel()).toBe('Cherry');
  });

  it('skips disabled rows', () => {
    render(
      <Autocomplete
        label="Fruit"
        options={[
          { value: 'a', label: 'Apple' },
          { value: 'b', label: 'Banana', disabled: true },
          { value: 'c', label: 'Cherry' },
        ]}
      />,
    );
    act(() => box().focus());
    key('ArrowDown');
    key('ArrowDown');
    expect(activeLabel()).toBe('Cherry');
    key('Home');
    key('End');
    expect(activeLabel()).toBe('Cherry');
  });

  it('Enter chooses the active row and closes; the active row also follows the pointer', () => {
    const onValueChange = vi.fn();
    render(<Autocomplete label="Fruit" options={OPTS} onValueChange={onValueChange} />);
    openByClick();
    fireEvent.pointerMove(screen.getByRole('option', { name: 'Cherry' }));
    expect(activeLabel()).toBe('Cherry');
    key('Enter');
    expect(onValueChange).toHaveBeenCalledWith(OPTS[2]);
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('Enter with the list closed is left alone (a form can submit); open, it is never a submit', () => {
    render(<Autocomplete label="Fruit" options={OPTS} />);
    act(() => box().focus());
    expect(fireEvent.keyDown(box(), { key: 'Enter' })).toBe(true); // not prevented
    key('ArrowDown');
    expect(fireEvent.keyDown(box(), { key: 'Enter' })).toBe(false); // prevented (it chose a row)
    key('ArrowDown');
    expect(fireEvent.keyDown(box(), { key: 'Enter' })).toBe(false);
  });

  it('an IME that is still composing gets all its keys', () => {
    render(<Autocomplete label="Fruit" options={OPTS} />);
    act(() => box().focus());
    fireEvent.keyDown(box(), { key: 'ArrowDown', isComposing: true });
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('tells the app when the list opens and closes, once each', () => {
    const onOpenChange = vi.fn();
    render(<Autocomplete label="Fruit" options={OPTS} onOpenChange={onOpenChange} />);
    expect(onOpenChange).not.toHaveBeenCalled();
    openByClick();
    key('ArrowDown');
    expect(onOpenChange.mock.calls).toEqual([[true]]);
    key('Escape');
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
  });
});

describe('Autocomplete: loading', () => {
  it('shows a lone spinner under the rows, marks the list busy and says so in words for a screen reader', () => {
    render(<Autocomplete label="City" options={CITIES} loading />);
    openByClick();
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-busy', 'true');
    expect(options()).toHaveLength(4);
    expect(spinner()).toBeInTheDocument();
    expect(statusRow('Carregando…')).toBeNull(); // nothing to read on screen: just the spinner
    expect(screen.getByRole('status')).toHaveTextContent('Carregando…');
  });

  it('loading with nothing yet shows only the spinner, not "no results"', () => {
    render(<Autocomplete label="City" options={[]} loading />);
    openByClick();
    expect(spinner()).toBeInTheDocument();
    expect(statusRow('Nenhum resultado')).toBeNull();
  });

  it('the spinner goes away when the wait is over', () => {
    const { rerender } = render(<Autocomplete label="City" options={CITIES} loading />);
    openByClick();
    rerender(<Autocomplete label="City" options={CITIES} />);
    expect(spinner()).toBeNull();
  });

  it('settled: no busy flag, and the count is what a screen reader hears', () => {
    render(<Autocomplete label="City" options={CITIES} />);
    openByClick();
    expect(screen.getByRole('listbox')).not.toHaveAttribute('aria-busy');
    expect(screen.getByRole('status')).toHaveTextContent('4 resultados');
    typeIn('sal');
    expect(screen.getByRole('status')).toHaveTextContent('1 resultado');
  });

  it('the live region is there from the start and says nothing while closed', () => {
    render(<Autocomplete label="City" options={CITIES} />);
    expect(screen.getByRole('status')).toHaveTextContent('');
  });
});

describe('Autocomplete: placement', () => {
  it('is an in-place absolute child of the field, glued by the browser', () => {
    const { container } = render(<Autocomplete label="City" options={CITIES} />);
    openByClick();
    const panel = screen.getByRole('listbox').parentElement!;
    expect(container).toContainElement(panel);
    expect(panel.style.position).toBe('absolute');
  });

  it('inside a fixed container (a Dialog) it is portalled to the body and fixed', () => {
    const { container } = render(
      <div style={{ position: 'fixed', inset: 0 }}>
        <Autocomplete label="City" options={CITIES} />
      </div>,
    );
    openByClick();
    const panel = screen.getByRole('listbox').parentElement!;
    expect(container).not.toContainElement(panel);
    expect(panel.style.position).toBe('fixed');
  });

  it('the rows are finger-sized on a touch screen, and choosing puts the keyboard away', () => {
    asCoarse(() => {
      render(<Autocomplete label="City" options={CITIES} />);
      openByClick();
      expect(screen.getAllByRole('option')[0].style.minHeight).toBe('44px');
      fireEvent.click(screen.getByRole('option', { name: 'Salvador' }));
      expect(document.activeElement).not.toBe(box());
      expect(box().value).toBe('Salvador');
    });
  });
});

describe('Autocomplete: accessibility (axe), open', () => {
  const AXE = { rules: { region: { enabled: false } } };

  it('open, with a chosen row, a hint and the clear button', async () => {
    render(<Autocomplete label="City" hint="Where you live" options={CITIES} defaultValue={CITIES[1]} />);
    openByClick();
    expect(await axe(document.body, AXE)).toHaveNoViolations();
  });

  it('open and loading, and open with no result', async () => {
    const { rerender } = render(<Autocomplete label="City" options={CITIES} loading />);
    openByClick();
    expect(await axe(document.body, AXE)).toHaveNoViolations();
    rerender(<Autocomplete label="City" options={[]} />);
    expect(await axe(document.body, AXE)).toHaveNoViolations();
  });
});
