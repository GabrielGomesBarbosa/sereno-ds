'use client';

import * as React from 'react';
import { ChevronDown, ChevronsUpDown, ChevronUp } from 'lucide-react';
import { sx } from '../_internal/style';

/**
 * Data table — a **compound component**. Cells hold real JSX, not `render`
 * callbacks. Structure, density, row dividers and hover / focus / sticky / zebra
 * live in `@sereno/ui/styles.css` (keyed off `data-*` on the root), so the parts
 * stay thin.
 *
 * ```tsx
 * <Table caption="Clientes" density="compact" stickyHeader>
 *   <Table.Head>
 *     <Table.Row>
 *       <Table.HeaderCell sortKey="name" sort={sort} onSort={setSort}>Cliente</Table.HeaderCell>
 *       <Table.HeaderCell align="right">Sessões</Table.HeaderCell>
 *       <Table.HeaderCell srOnly>Ações</Table.HeaderCell>
 *     </Table.Row>
 *   </Table.Head>
 *   <Table.Body>
 *     {rows.map((r) => (
 *       <Table.Row key={r.id} onClick={() => open(r)}>
 *         <Table.Cell>{r.name}</Table.Cell>
 *         <Table.Cell align="right">{r.sessions}</Table.Cell>
 *         <Table.Cell align="right"><IconButton …/></Table.Cell>
 *       </Table.Row>
 *     ))}
 *   </Table.Body>
 * </Table>
 * ```
 *
 * `sort` is controlled — the DS never reorders the rows; react to `onSort` and
 * feed sorted data back in.
 */
export type SortDirection = 'asc' | 'desc';
export interface TableSort {
  key: string;
  direction: SortDirection;
}

type Align = 'left' | 'center' | 'right';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  /** Visually-hidden `<caption>`; also the default accessible name for the scroll region. */
  caption?: string;
  density?: 'comfortable' | 'compact';
  /** Keeps the table this wide — below it the `role="region"` scrolls horizontally
   * instead of the columns squashing. Set it for anything with more than ~3
   * columns that has to survive a phone. */
  minWidth?: number | string;
  /** Pins the header while the body scrolls — pair it with `maxHeight`. */
  stickyHeader?: boolean;
  /** Caps the scroll region's height, so `stickyHeader` has something to stick within. */
  maxHeight?: number | string;
  /** Faint striping on even rows. Off by default — the row hover is usually enough. */
  zebra?: boolean;
  /** Accessible name for the scrollable region (defaults to `caption`). */
  regionLabel?: string;
  children: React.ReactNode;
}

function TableRoot({
  caption,
  density = 'comfortable',
  minWidth,
  stickyHeader = false,
  maxHeight,
  zebra = false,
  regionLabel,
  className,
  children,
  style,
  ...rest
}: TableProps) {
  return (
    <div
      className="sereno-table-scroll"
      role="region"
      aria-label={regionLabel ?? caption}
      tabIndex={0}
      style={sx({
        // Containment is inline (not just in styles.css) so a stale cached
        // stylesheet can't let the wide table blow the page out sideways.
        // `width:100%` + `minWidth:0` = size to the container, never the content;
        // `maxWidth:100%` caps it; `overflow:auto` scrolls the table inside here.
        // `position:relative` keeps the visually-hidden `<caption>` (position:absolute)
        // anchored HERE — without it the caption escapes to the viewport and its
        // static offset stretches the page's scroll height (a phantom scrollbar).
        position: 'relative',
        display: 'block',
        width: '100%',
        minWidth: 0,
        maxWidth: '100%',
        overflow: 'auto',
        ...(maxHeight != null ? { maxHeight } : {}),
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 0 0 1px var(--border-default)',
        background: 'var(--bg-surface)',
      })}
    >
      <table
        {...rest}
        data-density={density}
        data-sticky={stickyHeader || undefined}
        data-zebra={zebra || undefined}
        className={['sereno-table', className].filter(Boolean).join(' ')}
        style={sx({ ...(minWidth != null ? { minWidth } : {}), ...style })}
      >
        {caption ? <caption>{caption}</caption> : null}
        {children}
      </table>
    </div>
  );
}

function Head(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead {...props} />;
}

function Body(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} />;
}

export interface TableRowProps extends Omit<React.HTMLAttributes<HTMLTableRowElement>, 'onClick'> {
  /** Makes the row a button: pointer cursor, hover, focusable, Enter / Space activate. */
  onClick?: () => void;
  selected?: boolean;
}

function Row({ onClick, selected, children, style, ...rest }: TableRowProps) {
  const interactive = !!onClick;
  return (
    <tr
      {...rest}
      data-interactive={interactive || undefined}
      data-selected={selected || undefined}
      aria-pressed={interactive ? !!selected : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick!();
              }
            }
          : undefined
      }
      style={sx({ ...style })}
    >
      {children}
    </tr>
  );
}

const srOnlyStyle: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
};

export interface HeaderCellProps extends Omit<React.ThHTMLAttributes<HTMLTableCellElement>, 'align'> {
  align?: Align;
  width?: number | string;
  /** Turns the header into a sort control. Sorting the rows is the caller's job — react to `onSort`. */
  sortKey?: string;
  sort?: TableSort | null;
  onSort?: (next: TableSort) => void;
  /** Visually-hide the label (e.g. an actions column) — still announced by assistive tech. */
  srOnly?: boolean;
}

function HeaderCell({ align = 'left', width, sortKey, sort, onSort, srOnly, children, style, ...rest }: HeaderCellProps) {
  const sortable = !!sortKey;
  const active = sortable && sort?.key === sortKey;
  const dir = active ? sort!.direction : undefined;
  const label = srOnly ? <span style={srOnlyStyle}>{children}</span> : children;

  return (
    <th
      {...rest}
      scope="col"
      data-sortable={sortable || undefined}
      aria-sort={sortable ? (active ? (dir === 'asc' ? 'ascending' : 'descending') : 'none') : undefined}
      style={sx({ textAlign: align, ...(width != null ? { width } : {}), ...style })}
    >
      {sortable ? (
        <button
          type="button"
          onClick={() => onSort?.({ key: sortKey!, direction: active && dir === 'asc' ? 'desc' : 'asc' })}
          style={sx({
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            width: '100%',
            justifyContent: align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            font: 'inherit',
            letterSpacing: 'inherit',
            textTransform: 'inherit',
            color: active ? 'var(--text-primary)' : 'inherit',
          })}
        >
          {label}
          {active ? (
            dir === 'asc' ? (
              <ChevronUp size={14} strokeWidth={2.25} />
            ) : (
              <ChevronDown size={14} strokeWidth={2.25} />
            )
          ) : (
            <ChevronsUpDown size={14} strokeWidth={2} style={{ opacity: 0.55 }} />
          )}
        </button>
      ) : (
        label
      )}
    </th>
  );
}

export interface CellProps extends Omit<React.TdHTMLAttributes<HTMLTableCellElement>, 'align'> {
  align?: Align;
  width?: number | string;
  /** Let this cell's text wrap. Cells are `nowrap` by default (the region scrolls). */
  wrap?: boolean;
}

function Cell({ align = 'left', width, wrap, children, style, ...rest }: CellProps) {
  return (
    <td
      {...rest}
      data-wrap={wrap || undefined}
      style={sx({ textAlign: align, ...(width != null ? { width } : {}), ...style })}
    >
      {children}
    </td>
  );
}

export const Table = Object.assign(TableRoot, {
  Head,
  Body,
  Row,
  HeaderCell,
  Cell,
});
