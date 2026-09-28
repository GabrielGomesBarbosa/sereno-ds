'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { sx } from '../_internal/style';
import { getPageItems } from '../_internal/pageRange';
import { IconButton } from '../core/IconButton';

/**
 * Page navigation for a long list or a `Table`: previous / next, a run of page numbers
 * with "…" where pages are folded away, and (optionally) first / last. A dedicated
 * control, not a `Table` feature. The table never paginates for you; you slice the rows
 * and pass the page in.
 *
 * ```tsx
 * const [page, setPage] = React.useState(1);
 * const pageSize = 10;
 *
 * <Table caption="Clients">…{rows.slice((page - 1) * pageSize, page * pageSize)}…</Table>
 * <Pagination page={page} pageCount={Math.ceil(rows.length / pageSize)} onPageChange={setPage} />
 * ```
 *
 * **Controlled**: `page` is 1-based and lives in your state, next to the data fetching it
 * drives. A **config API**, not a compound one, since there's nothing a consumer would
 * author per page (same call as `Select`, see AGENTS.md). Under `--bp-sm` (560px) the
 * numbers fold away and it becomes previous / "Page 3 of 12" / next, so it fits a phone.
 */
export interface PaginationLabels {
  /** Accessible name of the `<nav>` landmark. Give each one a distinct name if a page has several. */
  navigation: string;
  first: string;
  previous: string;
  next: string;
  last: string;
  /** Accessible name of a page button, e.g. "Page 3". */
  page: (page: number) => string;
  /** "Page 3 of 12": the compact strip on a phone, and the polite announcement after a change. */
  status: (page: number, pageCount: number) => string;
}

/** English by default; pass `labels` for another locale (the DS embeds no localised copy). */
const EN: PaginationLabels = {
  navigation: 'Pagination',
  first: 'First page',
  previous: 'Previous page',
  next: 'Next page',
  last: 'Last page',
  page: (page) => `Page ${page}`,
  status: (page, pageCount) => `Page ${page} of ${pageCount}`,
};

export interface PaginationProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange' | 'children'> {
  /** The current page, 1-based. Out-of-range values are clamped for display. */
  page: number;
  /** How many pages there are in total. Renders nothing under 1. */
  pageCount: number;
  onPageChange: (page: number) => void;
  /** Pages shown either side of the current one. */
  siblingCount?: number;
  /** Pages always shown at each end. */
  boundaryCount?: number;
  /** Button size. `lg` (48px) for touch-first screens. */
  size?: 'sm' | 'md' | 'lg';
  /** Also show first / last page buttons. */
  showEdges?: boolean;
  disabled?: boolean;
  /** Override the English UI strings. */
  labels?: Partial<PaginationLabels>;
}

const ICON = { sm: 16, md: 18, lg: 20 } as const;
/** `IconButton`'s own square sizes. The ellipsis is given the same width, so it takes exactly a page button's room. */
const BOX = { sm: 32, md: 40, lg: 48 } as const;
const DIGITS = { sm: 'var(--text-sm)', md: 'var(--text-sm)', lg: 'var(--text-base)' } as const;

/** Visually hidden, still read by assistive tech (same idea as the Table's `<caption>`). */
const SR_ONLY = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
} as const;

export function Pagination({
  page: pageProp,
  pageCount: pageCountProp,
  onPageChange,
  siblingCount = 1,
  boundaryCount = 1,
  size = 'md',
  showEdges = false,
  disabled = false,
  labels: labelsProp,
  style,
  ...rest
}: PaginationProps) {
  const t = React.useMemo<PaginationLabels>(() => ({ ...EN, ...labelsProp }), [labelsProp]);

  // NaN / Infinity (say `Math.ceil(0 / 0)` from a zero page size) count as "no pages".
  const count = Number.isFinite(pageCountProp) ? Math.max(0, Math.floor(pageCountProp)) : 0;
  if (count < 1) return null;
  const page = Math.min(Math.max(Math.floor(pageProp) || 1, 1), count);

  const go = (next: number) => {
    if (disabled || next === page || next < 1 || next > count) return;
    onPageChange(next);
  };

  const items = getPageItems(page, count, siblingCount, boundaryCount);
  const icon = { size: ICON[size], strokeWidth: 1.75 } as const;

  return (
    <nav aria-label={t.navigation} {...rest} style={sx({ position: 'relative', ...style })}>
      <ul
        style={sx({
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-1)',
          listStyle: 'none',
          margin: 0,
          padding: 0,
        })}
      >
        {showEdges && (
          <li className="sereno-pagination-edge">
            <IconButton label={t.first} size={size} disabled={disabled || page <= 1} onClick={() => go(1)}>
              <ChevronsLeft {...icon} />
            </IconButton>
          </li>
        )}
        <li>
          <IconButton label={t.previous} size={size} disabled={disabled || page <= 1} onClick={() => go(page - 1)}>
            <ChevronLeft {...icon} />
          </IconButton>
        </li>

        {items.map((item) =>
          typeof item === 'number' ? (
            <li key={item} className="sereno-pagination-page">
              {/* An `IconButton`, not a `Button`: a fixed square, so "9" and "10" take the same room
                  and the control does not change width as you page. The number is just its content. */}
              <IconButton
                variant={item === page ? 'primary' : 'ghost'}
                size={size}
                disabled={disabled}
                label={t.page(item)}
                aria-current={item === page ? 'page' : undefined}
                onClick={() => go(item)}
              >
                <span
                  style={sx({
                    fontFamily: 'var(--font-body)',
                    fontSize: DIGITS[size],
                    fontWeight: item === page ? 'var(--weight-semibold)' : 'var(--weight-medium)',
                    fontVariantNumeric: 'tabular-nums',
                    lineHeight: 1,
                  })}
                >
                  {item}
                </span>
              </IconButton>
            </li>
          ) : (
            <li
              key={item}
              aria-hidden="true"
              className="sereno-pagination-ellipsis"
              style={sx({ width: BOX[size], textAlign: 'center', color: 'var(--text-muted)', userSelect: 'none' })}
            >
              …
            </li>
          ),
        )}

        {/* Phone-width stand-in for the numbers (shown by styles.css under --bp-sm). The
            announcement below is what assistive tech reads, so this one is hidden from it. */}
        <li aria-hidden="true" className="sereno-pagination-status">
          {t.status(page, count)}
        </li>

        <li>
          <IconButton label={t.next} size={size} disabled={disabled || page >= count} onClick={() => go(page + 1)}>
            <ChevronRight {...icon} />
          </IconButton>
        </li>
        {showEdges && (
          <li className="sereno-pagination-edge">
            <IconButton label={t.last} size={size} disabled={disabled || page >= count} onClick={() => go(count)}>
              <ChevronsRight {...icon} />
            </IconButton>
          </li>
        )}
      </ul>

      {/* Announces the new page after a change. Without it a screen-reader user who presses
          "Next" hears nothing, since focus stays on the button and only the list changed. */}
      <span role="status" style={sx(SR_ONLY)}>
        {t.status(page, count)}
      </span>
    </nav>
  );
}
