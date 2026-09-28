import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination, type PaginationProps } from './Pagination';

afterEach(cleanup);

const setup = (props: Partial<PaginationProps> = {}) => {
  const onPageChange = vi.fn();
  const utils = render(<Pagination page={3} pageCount={12} onPageChange={onPageChange} {...props} />);
  return { onPageChange, ...utils };
};

/** The numbered page buttons, by their visible number. */
const pageNumbers = () =>
  screen
    .getAllByRole('button')
    .filter((b) => /^Page \d+$/.test(b.getAttribute('aria-label') ?? ''))
    .map((b) => b.textContent);

describe('Pagination, structure and accessibility', () => {
  it('is a named navigation landmark with previous, next and the page buttons in a list', () => {
    setup();
    const nav = screen.getByRole('navigation', { name: 'Pagination' });
    expect(within(nav).getByRole('list')).toBeInTheDocument();
    expect(within(nav).getByRole('button', { name: 'Previous page' })).toBeInTheDocument();
    expect(within(nav).getByRole('button', { name: 'Next page' })).toBeInTheDocument();
    expect(within(nav).getByRole('button', { name: 'Page 3' })).toBeInTheDocument();
  });

  it('marks exactly the current page with aria-current="page"', () => {
    setup({ page: 5, pageCount: 12 });
    const current = document.querySelectorAll('[aria-current="page"]');
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveAccessibleName('Page 5');
  });

  it('hides the ellipses from assistive tech and never makes them a control', () => {
    setup({ page: 10, pageCount: 20 });
    const ellipses = document.querySelectorAll('.sereno-pagination-ellipsis');
    expect(ellipses).toHaveLength(2);
    ellipses.forEach((e) => {
      expect(e).toHaveAttribute('aria-hidden', 'true');
      expect(within(e as HTMLElement).queryByRole('button')).toBeNull();
    });
  });

  it('announces the page politely after a change (focus stays on the button, so nothing else would)', () => {
    const { rerender, onPageChange } = setup({ page: 3, pageCount: 12 });
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Page 3 of 12');
    rerender(<Pagination page={4} pageCount={12} onPageChange={onPageChange} />);
    expect(screen.getByRole('status')).toHaveTextContent('Page 4 of 12');
  });

  it('renders the phone-width stand-in ("Page X of Y") hidden from assistive tech, so it is not read twice', () => {
    setup({ page: 3, pageCount: 12 });
    const compact = document.querySelector('.sereno-pagination-status') as HTMLElement;
    expect(compact).toHaveTextContent('Page 3 of 12');
    expect(compact).toHaveAttribute('aria-hidden', 'true');
  });

  it('tags what the phone layout folds away (styles.css hides these under --bp-sm)', () => {
    setup({ page: 10, pageCount: 20, showEdges: true });
    expect(document.querySelectorAll('.sereno-pagination-page').length).toBeGreaterThan(0);
    expect(document.querySelectorAll('.sereno-pagination-ellipsis')).toHaveLength(2);
    expect(document.querySelectorAll('.sereno-pagination-edge')).toHaveLength(2);
    // previous / next are never folded away
    expect(screen.getByRole('button', { name: 'Previous page' }).closest('li')).not.toHaveClass('sereno-pagination-page');
    expect(screen.getByRole('button', { name: 'Next page' }).closest('li')).not.toHaveClass('sereno-pagination-edge');
  });

  it('passes extra props through, and a caller aria-label wins over the default name', () => {
    setup({ 'aria-label': 'Client pages', className: 'mine', id: 'p1' });
    const nav = screen.getByRole('navigation', { name: 'Client pages' });
    expect(nav).toHaveClass('mine');
    expect(nav).toHaveAttribute('id', 'p1');
  });
});

describe('Pagination, navigating', () => {
  it('calls onPageChange with the clicked page', () => {
    const { onPageChange } = setup({ page: 3, pageCount: 12 });
    fireEvent.click(screen.getByRole('button', { name: 'Page 5' }));
    expect(onPageChange).toHaveBeenCalledTimes(1);
    expect(onPageChange).toHaveBeenCalledWith(5);
  });

  it('does nothing when the current page is clicked', () => {
    const { onPageChange } = setup({ page: 3, pageCount: 12 });
    fireEvent.click(screen.getByRole('button', { name: 'Page 3' }));
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('steps one page with previous and next', () => {
    const { onPageChange } = setup({ page: 6, pageCount: 12 });
    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(onPageChange).toHaveBeenLastCalledWith(5);
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange).toHaveBeenLastCalledWith(7);
  });

  it('disables previous on the first page and next on the last, and never fires past the ends', () => {
    const first = setup({ page: 1, pageCount: 12 });
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(first.onPageChange).not.toHaveBeenCalled();
    cleanup();

    const last = setup({ page: 12, pageCount: 12 });
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(last.onPageChange).not.toHaveBeenCalled();
  });

  it('has no first / last buttons by default, and jumps to the ends with showEdges', () => {
    setup({ page: 6, pageCount: 12 });
    expect(screen.queryByRole('button', { name: 'First page' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Last page' })).toBeNull();
    cleanup();

    const { onPageChange } = setup({ page: 6, pageCount: 12, showEdges: true });
    fireEvent.click(screen.getByRole('button', { name: 'First page' }));
    expect(onPageChange).toHaveBeenLastCalledWith(1);
    fireEvent.click(screen.getByRole('button', { name: 'Last page' }));
    expect(onPageChange).toHaveBeenLastCalledWith(12);
  });

  it('disables first / last at the ends too', () => {
    setup({ page: 1, pageCount: 12, showEdges: true });
    expect(screen.getByRole('button', { name: 'First page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Last page' })).toBeEnabled();
    cleanup();
    setup({ page: 12, pageCount: 12, showEdges: true });
    expect(screen.getByRole('button', { name: 'Last page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'First page' })).toBeEnabled();
  });

  it('is operable from the keyboard: Tab to a page, Enter or Space activates it', async () => {
    const user = userEvent.setup();
    const { onPageChange } = setup({ page: 3, pageCount: 12 });
    act(() => screen.getByRole('button', { name: 'Previous page' }).focus());
    await user.tab(); // page 1
    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onPageChange).toHaveBeenLastCalledWith(1);
    await user.tab(); // page 2
    await user.keyboard(' ');
    expect(onPageChange).toHaveBeenLastCalledWith(2);
  });
});

describe('Pagination, which pages it shows', () => {
  it('keeps the same number of slots (page buttons + ellipses) wherever the current page is, so it does not change width', () => {
    // An ellipsis takes the room of a page button (same min-width), so the slot count is what
    // stays put: `1 2 3 4 5 … 20` and `1 … 9 10 11 … 20` are both 7 wide.
    const widths = [1, 2, 5, 10, 19, 20].map((page) => {
      const { unmount } = render(<Pagination page={page} pageCount={20} onPageChange={() => {}} />);
      const slots = document.querySelectorAll('.sereno-pagination-page, .sereno-pagination-ellipsis').length;
      unmount();
      return slots;
    });
    expect(new Set(widths).size).toBe(1);
    expect(widths[0]).toBe(7);
  });

  it('folds pages away with an ellipsis, and shows every page when they all fit', () => {
    setup({ page: 10, pageCount: 20 });
    expect(pageNumbers()).toEqual(['1', '9', '10', '11', '20']);
    cleanup();
    setup({ page: 2, pageCount: 5 });
    expect(pageNumbers()).toEqual(['1', '2', '3', '4', '5']);
    expect(document.querySelectorAll('.sereno-pagination-ellipsis')).toHaveLength(0);
  });

  it('honours siblingCount and boundaryCount', () => {
    setup({ page: 10, pageCount: 20, siblingCount: 2, boundaryCount: 2 });
    expect(pageNumbers()).toEqual(['1', '2', '8', '9', '10', '11', '12', '19', '20']);
  });
});

describe('Pagination, edge cases', () => {
  it('clamps an out-of-range page for display', () => {
    setup({ page: 99, pageCount: 12 });
    expect(document.querySelector('[aria-current="page"]')).toHaveAccessibleName('Page 12');
    cleanup();
    setup({ page: 0, pageCount: 12 });
    expect(document.querySelector('[aria-current="page"]')).toHaveAccessibleName('Page 1');
  });

  it('renders nothing when there are no pages', () => {
    const { container } = setup({ pageCount: 0 });
    expect(container).toBeEmptyDOMElement();
  });

  it('treats a NaN or infinite pageCount (a zero page size divided through) as no pages, not a crash', () => {
    expect(setup({ pageCount: Number.NaN }).container).toBeEmptyDOMElement();
    cleanup();
    expect(setup({ pageCount: Number.POSITIVE_INFINITY }).container).toBeEmptyDOMElement();
  });

  it('renders a single page with both arrows disabled', () => {
    setup({ page: 1, pageCount: 1 });
    expect(pageNumbers()).toEqual(['1']);
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('disables every control, and calls nothing, when disabled', () => {
    const { onPageChange } = setup({ page: 6, pageCount: 12, showEdges: true, disabled: true });
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(4);
    buttons.forEach((b) => expect(b).toBeDisabled());
    buttons.forEach((b) => fireEvent.click(b));
    expect(onPageChange).not.toHaveBeenCalled();
  });
});

describe('Pagination, labels and size', () => {
  const PT = {
    navigation: 'Paginação',
    first: 'Primeira página',
    previous: 'Página anterior',
    next: 'Próxima página',
    last: 'Última página',
    page: (p: number) => `Página ${p}`,
    status: (p: number, n: number) => `Página ${p} de ${n}`,
  };

  it('takes every UI string from labels (the DS embeds no localised copy)', () => {
    setup({ page: 3, pageCount: 12, showEdges: true, labels: PT });
    expect(screen.getByRole('navigation', { name: 'Paginação' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Primeira página' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Próxima página' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Última página' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Página 3' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('status')).toHaveTextContent('Página 3 de 12');
  });

  it('a partial labels override keeps the English for the rest', () => {
    setup({ labels: { next: 'Seguinte' } });
    expect(screen.getByRole('button', { name: 'Seguinte' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeInTheDocument();
  });

  it.each([
    ['sm', '32px'],
    ['md', '40px'],
    ['lg', '48px'],
  ] as const)('size %s makes the arrows, the page buttons and the ellipsis all %s squares, so nothing shifts as you page', (size, px) => {
    setup({ size, page: 10, pageCount: 20 });
    expect(screen.getByRole('button', { name: 'Next page' }).style.width).toBe(px);
    expect(screen.getByRole('button', { name: 'Page 10' }).style.width).toBe(px);
    // "9" and "10" are the same square: the number is content, not what sizes the button
    expect(screen.getByRole('button', { name: 'Page 9' }).style.width).toBe(px);
    expect((document.querySelector('.sereno-pagination-ellipsis') as HTMLElement).style.width).toBe(px);
  });
});
