import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Table, type TableProps, type TableSort } from './Table';

afterEach(cleanup);

function Demo({
  sort = null,
  onSort,
  onRow,
  selected,
  ...props
}: Partial<TableProps> & { sort?: TableSort | null; onSort?: (s: TableSort) => void; onRow?: () => void; selected?: boolean }) {
  return (
    <Table caption="Clients" {...props}>
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell sortKey="name" sort={sort} onSort={onSort}>
            Name
          </Table.HeaderCell>
          <Table.HeaderCell align="right">Sessions</Table.HeaderCell>
          <Table.HeaderCell srOnly>Actions</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        <Table.Row onClick={onRow} selected={selected}>
          <Table.Cell>Ana</Table.Cell>
          <Table.Cell align="right">12</Table.Cell>
          <Table.Cell>
            <button type="button">Open</button>
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Marcos</Table.Cell>
          <Table.Cell align="right">3</Table.Cell>
          <Table.Cell />
        </Table.Row>
      </Table.Body>
    </Table>
  );
}

describe('Table', () => {
  describe('structure and names', () => {
    it('is a real table with a caption, column headers and rows', () => {
      render(<Demo />);
      const table = screen.getByRole('table', { name: 'Clients' });
      expect(within(table).getAllByRole('columnheader')).toHaveLength(3);
      expect(within(table).getAllByRole('row')).toHaveLength(3);
      expect(within(table).getByRole('cell', { name: 'Ana' })).toBeInTheDocument();
    });

    it('the scroll area is a named region when there is a caption, and a plain focusable box when there is not', () => {
      const { rerender } = render(<Demo />);
      expect(screen.getByRole('region', { name: 'Clients' })).toHaveAttribute('tabindex', '0');
      rerender(<Demo caption={undefined} />);
      expect(screen.queryByRole('region')).toBeNull();
    });

    it('regionLabel names the scroll area instead of the caption', () => {
      render(<Demo regionLabel="Client list, scrolls sideways" />);
      expect(screen.getByRole('region', { name: 'Client list, scrolls sideways' })).toBeInTheDocument();
    });

    it('every column header has scope="col"', () => {
      render(<Demo />);
      for (const th of screen.getAllByRole('columnheader')) expect(th).toHaveAttribute('scope', 'col');
    });

    it('an actions column with a visually hidden label is still announced', () => {
      render(<Demo />);
      expect(screen.getByRole('columnheader', { name: 'Actions' })).toBeInTheDocument();
    });
  });

  describe('layout options are exposed as data attributes (the stylesheet reads them)', () => {
    it('density defaults to comfortable', () => {
      render(<Demo />);
      expect(screen.getByRole('table')).toHaveAttribute('data-density', 'comfortable');
    });

    it('density, stickyHeader and zebra', () => {
      render(<Demo density="compact" stickyHeader zebra />);
      const table = screen.getByRole('table');
      expect(table).toHaveAttribute('data-density', 'compact');
      expect(table).toHaveAttribute('data-sticky', 'true');
      expect(table).toHaveAttribute('data-zebra', 'true');
    });

    it('stickyHeader and zebra are absent by default', () => {
      render(<Demo />);
      const table = screen.getByRole('table');
      expect(table).not.toHaveAttribute('data-sticky');
      expect(table).not.toHaveAttribute('data-zebra');
    });

    it('minWidth keeps the table wide so the region scrolls, and maxHeight caps the region', () => {
      render(<Demo minWidth={720} maxHeight={200} />);
      expect(screen.getByRole('table').style.minWidth).toBe('720px');
      expect(screen.getByRole('region').style.maxHeight).toBe('200px');
    });

    it('keeps the caller class next to its own', () => {
      render(<Demo className="mine" />);
      expect(screen.getByRole('table')).toHaveClass('sereno-table', 'mine');
    });

    it('cells align as asked, and can opt into wrapping', () => {
      render(
        <Table caption="t">
          <Table.Body>
            <Table.Row>
              <Table.Cell align="right" wrap width={90}>
                x
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>,
      );
      const td = screen.getByRole('cell');
      expect(td.style.textAlign).toBe('right');
      expect(td.style.width).toBe('90px');
      expect(td).toHaveAttribute('data-wrap', 'true');
    });
  });

  describe('sorting (controlled: the table never reorders rows itself)', () => {
    const header = () => screen.getByRole('columnheader', { name: /Name/ });

    it('a header with a sortKey is a button; one without is plain text', () => {
      render(<Demo />);
      expect(within(header()).getByRole('button')).toBeInTheDocument();
      expect(within(screen.getByRole('columnheader', { name: 'Sessions' })).queryByRole('button')).toBeNull();
    });

    it('says which way it is sorted with aria-sort', () => {
      const { rerender } = render(<Demo />);
      expect(header()).toHaveAttribute('aria-sort', 'none');
      rerender(<Demo sort={{ key: 'name', direction: 'asc' }} />);
      expect(header()).toHaveAttribute('aria-sort', 'ascending');
      rerender(<Demo sort={{ key: 'name', direction: 'desc' }} />);
      expect(header()).toHaveAttribute('aria-sort', 'descending');
    });

    it('another column being sorted leaves this one at "none"', () => {
      render(<Demo sort={{ key: 'sessions', direction: 'asc' }} />);
      expect(header()).toHaveAttribute('aria-sort', 'none');
    });

    it('a click asks for ascending first, then flips: none -> asc -> desc -> asc', async () => {
      const onSort = vi.fn();
      const { rerender } = render(<Demo onSort={onSort} />);
      await userEvent.click(within(header()).getByRole('button'));
      expect(onSort).toHaveBeenLastCalledWith({ key: 'name', direction: 'asc' });
      rerender(<Demo onSort={onSort} sort={{ key: 'name', direction: 'asc' }} />);
      await userEvent.click(within(header()).getByRole('button'));
      expect(onSort).toHaveBeenLastCalledWith({ key: 'name', direction: 'desc' });
      rerender(<Demo onSort={onSort} sort={{ key: 'name', direction: 'desc' }} />);
      await userEvent.click(within(header()).getByRole('button'));
      expect(onSort).toHaveBeenLastCalledWith({ key: 'name', direction: 'asc' });
    });

    it('the sort button works from the keyboard', async () => {
      const onSort = vi.fn();
      render(<Demo onSort={onSort} />);
      within(header()).getByRole('button').focus();
      await userEvent.keyboard('{Enter}');
      expect(onSort).toHaveBeenCalledTimes(1);
    });

    it('does not reorder the rows by itself', async () => {
      render(<Demo onSort={() => {}} />);
      await userEvent.click(within(header()).getByRole('button'));
      const names = screen.getAllByRole('row').slice(1).map((r) => within(r).getAllByRole('cell')[0].textContent);
      expect(names).toEqual(['Ana', 'Marcos']);
    });
  });

  describe('interactive rows', () => {
    it('a row with onClick is a button: focusable, with a pressed state', () => {
      render(<Demo onRow={() => {}} />);
      const row = screen.getByRole('button', { name: /Ana/ });
      expect(row).toHaveAttribute('tabindex', '0');
      expect(row).toHaveAttribute('aria-pressed', 'false');
    });

    it('selected is exposed as pressed', () => {
      render(<Demo onRow={() => {}} selected />);
      const row = screen.getByRole('button', { name: /Ana/ });
      expect(row).toHaveAttribute('aria-pressed', 'true');
      expect(row).toHaveAttribute('data-selected', 'true');
    });

    it('a row without onClick is just a row: not focusable, not a button', () => {
      render(<Demo />);
      const row = screen.getByRole('row', { name: /Marcos/ });
      expect(row).not.toHaveAttribute('tabindex');
      expect(row).not.toHaveAttribute('role');
      expect(row).not.toHaveAttribute('aria-pressed');
    });

    it('activates with a click, with Enter and with Space', async () => {
      const onRow = vi.fn();
      render(<Demo onRow={onRow} />);
      const row = screen.getByRole('button', { name: /Ana/ });
      await userEvent.click(row);
      row.focus();
      await userEvent.keyboard('{Enter}');
      await userEvent.keyboard(' ');
      expect(onRow).toHaveBeenCalledTimes(3);
    });

    it('other keys do nothing', async () => {
      const onRow = vi.fn();
      render(<Demo onRow={onRow} />);
      screen.getByRole('button', { name: /Ana/ }).focus();
      await userEvent.keyboard('a{ArrowDown}{Escape}');
      expect(onRow).not.toHaveBeenCalled();
    });

    it('Space on a row does not scroll the page (the default action is prevented)', () => {
      render(<Demo onRow={() => {}} />);
      const row = screen.getByRole('button', { name: /Ana/ });
      const e = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
      row.dispatchEvent(e);
      expect(e.defaultPrevented).toBe(true);
    });
  });
});
