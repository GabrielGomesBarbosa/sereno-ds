import type { ComponentMeta } from '../catalog';
import { R } from './_shared';

export const paginationMeta: ComponentMeta = {
  slug: 'pagination',
  name: 'Pagination',
  category: 'navigation',
  summary:
    'Page navigation for a long list or a `Table`: previous / next, a run of page numbers with an ellipsis where pages fold away, and optional first / last. A dedicated control, **controlled** and config-API. The `Table` never paginates for you: slice the rows and pass the page in. Under 560px the numbers fold away to previous / "Page X of Y" / next.',
  props: [
    R('page', 'number', 'The current page, **1-based**. Controlled: it lives in your state, next to the data fetching it drives. An out-of-range value is clamped for display.'),
    R('pageCount', 'number', 'Total number of pages (`Math.ceil(total / pageSize)`). Renders nothing under 1.'),
    R('onPageChange', '(page: number) => void', 'Called with the page the user picked. Never called for the current page, nor past either end.'),
    R('siblingCount', 'number', 'Pages shown either side of the current one.', '1'),
    R('boundaryCount', 'number', 'Pages always shown at each end.', '1'),
    R('size', "'sm' | 'md' | 'lg'", 'Control size: square 32 / 40 / 48px buttons, the same as `IconButton`. `lg` for touch-first screens.', "'md'"),
    R('showEdges', 'boolean', 'Also show first / last page buttons.', 'false'),
    R('disabled', 'boolean', 'Disables every control, for example while the next page is loading.', 'false'),
    R('labels', 'Partial<PaginationLabels>', 'Override the English UI strings: `navigation`, `first`, `previous`, `next`, `last`, `page(n)` and `status(page, count)`.'),
  ],
  code: `const [page, setPage] = React.useState(1);
const pageSize = 10;

<Table caption="Clients">…{rows.slice((page - 1) * pageSize, page * pageSize)}…</Table>

<Pagination
  page={page}
  pageCount={Math.ceil(rows.length / pageSize)}
  onPageChange={setPage}
/>`,
  examples: [
    {
      id: 'basic',
      title: 'Basic',
      description:
        'Controlled: keep `page` in state and hand it back. The numbers keep the **same width** wherever you are (an ellipsis takes the room of a page button), so the control does not jump as you page. An ellipsis only ever hides two or more pages; a gap of exactly one shows that page.',
      code: `<Pagination page={page} pageCount={20} onPageChange={setPage} />`,
    },
    {
      id: 'with-table',
      title: 'Under a Table',
      description:
        'The usual pairing. The `Table` shows the rows you slice; a footer row carries the "Showing X to Y of Z" text and the `Pagination`, and wraps on a narrow screen. Slice, count and page all stay in your code, since the DS never paginates for you.',
      code: `const start = (page - 1) * pageSize;

<Table caption="Clients">…{rows.slice(start, start + pageSize)}…</Table>

<div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }}>
  <span>Showing {start + 1} to {Math.min(start + pageSize, rows.length)} of {rows.length}</span>
  <Pagination page={page} pageCount={Math.ceil(rows.length / pageSize)} onPageChange={setPage} />
</div>`,
    },
    {
      id: 'edges',
      title: 'First and last, more siblings',
      description:
        '`showEdges` adds first / last page buttons, for long lists. `siblingCount` widens the window around the current page; `boundaryCount` does the same for the pinned ends. The more slots, the wider it gets, and it wraps onto a second line rather than overflow when the room runs out.',
      code: `<Pagination page={page} pageCount={60} showEdges siblingCount={2} onPageChange={setPage} />`,
    },
    {
      id: 'sizes',
      title: 'Sizes',
      description: '`sm`, `md` and `lg` are the same square 32 / 40 / 48px controls as `IconButton`, page numbers included, so "9" and "10" take the same room. Prefer `lg` (a 48px tap target) where the screen is touch-first.',
      code: `<Pagination size="sm" … />
<Pagination size="md" … />
<Pagination size="lg" … />`,
    },
    {
      id: 'labels',
      title: 'Localised',
      description:
        'The DS embeds no localised copy: every string (the landmark name, each button, the "Page X of Y" announcement) comes from `labels`, English by default. Pass only what you change.',
      code: `<Pagination
  page={page}
  pageCount={12}
  onPageChange={setPage}
  labels={{
    navigation: 'Paginação',
    previous: 'Página anterior',
    next: 'Próxima página',
    page: (n) => \`Página \${n}\`,
    status: (n, total) => \`Página \${n} de \${total}\`,
  }}
/>`,
    },
    {
      id: 'disabled',
      title: 'Disabled',
      description: '`disabled` locks every control and calls nothing, for example while the next page of results is loading.',
      code: `<Pagination page={3} pageCount={12} onPageChange={setPage} disabled={loading} />`,
    },
  ],
  guidelines: {
    do: [
      'Slice the rows and compute `pageCount` in your code, next to the data fetching. `page` is 1-based.',
      'Put a "Showing X to Y of Z" line beside it under a `Table`: the page numbers alone do not say how big the list is.',
      'Give each `Pagination` on a page its own `labels.navigation` when there are several, so the landmarks are told apart.',
      'Pass `labels` for your app’s language: the DS default is English.',
      'Use `size="lg"` on touch-first screens. Under 560px it already folds to previous / "Page X of Y" / next.',
    ],
    dont: [
      'Rendering it for a single page. There is nothing to navigate, so skip it (`pageCount <= 1`).',
      'Expecting the `Table` to paginate. `Table` and `Pagination` are separate: the rows you slice are the rows it shows.',
      'Using it for a long feed where the user just keeps reading. Infinite scroll or a "Load more" button fits that better.',
    ],
  },
};
