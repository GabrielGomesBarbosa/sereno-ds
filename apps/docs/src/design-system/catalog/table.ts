import type { ComponentMeta } from '../catalog';
import { R } from './_shared';

export const tableMeta: ComponentMeta = {
  slug: 'table',
  name: 'Table',
  category: 'core',
  summary: 'Data table: a **compound component**. Cells hold real JSX; structure, density, dividers and hover / focus / sticky / zebra ship in the stylesheet. Sorting is controlled: the DS never reorders the rows.',
  props: [
    R('caption', 'string', 'Visually-hidden `<caption>` and the default accessible name for the scroll region. Always set one.'),
    R('density', "'comfortable' | 'compact'", 'Row padding. `compact` for dense CRM / reports.', "'comfortable'"),
    R('minWidth', 'number | string', 'Floor width for the table. Below it the scroll region takes a sideways scrollbar instead of the columns squashing. Set it on anything with more than ~3 columns that has to survive a phone.'),
    R('stickyHeader / maxHeight', 'boolean / number | string', 'Pin the header while the body scrolls, pair them so the head has a bounded region to stick within.'),
    R('zebra', 'boolean', 'Faint striping on even rows. Off by default: the hover is usually enough.', 'false'),
    R('Table.Row · onClick', '() => void', 'Makes the row a button: hover, pointer, focusable, Enter / Space.'),
    R('Table.Row · selected', 'boolean', 'Brand-soft fill for the chosen row.', 'false'),
    R('Table.HeaderCell · sortKey / sort / onSort', 'string / TableSort | null / (s) => void', 'Turns the header into a sort control. React to `onSort` and feed sorted rows back, the DS does not sort.'),
    R('Table.HeaderCell · srOnly', 'boolean', 'Visually-hide the header label (e.g. an actions column): still read by assistive tech.'),
    R('Table.Cell / Table.HeaderCell · align', "'left' | 'center' | 'right'", 'Text alignment. Right for numbers.', "'left'"),
    R('Table.Cell · wrap', 'boolean', 'Let this cell wrap. Cells are `nowrap` by default so `minWidth` can do its job, opt one column back in for long free text.', 'false'),
  ],
  code: `<Table caption="Clients" density="compact" stickyHeader>
  <Table.Head>
    <Table.Row>
      <Table.HeaderCell sortKey="name" sort={sort} onSort={setSort}>Client</Table.HeaderCell>
      <Table.HeaderCell align="right">Sessions</Table.HeaderCell>
      <Table.HeaderCell srOnly>Actions</Table.HeaderCell>
    </Table.Row>
  </Table.Head>
  <Table.Body>
    {rows.map((r) => (
      <Table.Row key={r.id} onClick={() => open(r)}>
        <Table.Cell>{r.name}</Table.Cell>
        <Table.Cell align="right">{r.sessions}</Table.Cell>
        <Table.Cell align="right"><IconButton …/></Table.Cell>
      </Table.Row>
    ))}
  </Table.Body>
</Table>`,
  examples: [
    {
      id: 'basic',
      title: 'Basic',
      description: '`Table.Head` + `Table.Body`, plain `Table.Cell`s. Always pass a `caption`; it names the table and the scroll region for assistive tech.',
      code: `<Table caption="Clients">
  <Table.Head>
    <Table.Row>
      <Table.HeaderCell>Client</Table.HeaderCell>
      <Table.HeaderCell align="right">Sessions</Table.HeaderCell>
      <Table.HeaderCell>Status</Table.HeaderCell>
    </Table.Row>
  </Table.Head>
  <Table.Body>
    {rows.map((r) => (
      <Table.Row key={r.id}>
        <Table.Cell>{r.name}</Table.Cell>
        <Table.Cell align="right">{r.sessions}</Table.Cell>
        <Table.Cell><Badge tone={r.status}>{label}</Badge></Table.Cell>
      </Table.Row>
    ))}
  </Table.Body>
</Table>`,
    },
    {
      id: 'sortable',
      title: 'Sortable',
      description: '`sortKey` + controlled `sort` / `onSort` on a `HeaderCell`. The chevron reflects the state; **you** sort the `rows` and pass them back, the DS never reorders data.',
      code: `const [sort, setSort] = useState({ key: 'name', direction: 'asc' });
const rows = useMemo(() => sortRows(DATA, sort), [sort]);

<Table.HeaderCell sortKey="name" sort={sort} onSort={setSort}>Client</Table.HeaderCell>
<Table.HeaderCell align="right" sortKey="sessions" sort={sort} onSort={setSort}>Sessions</Table.HeaderCell>`,
    },
    {
      id: 'interactive',
      title: 'Clickable rows',
      description: '`onClick` on `Table.Row` makes the whole row a button, hover, `Enter` / `Space`, focus ring. `selected` marks one. Don’t also put a `<button>` in a cell, pick one target.',
      code: `<Table.Row selected={r.id === picked} onClick={() => setPicked(r.id)}>
  <Table.Cell>{r.name}</Table.Cell>
  <Table.Cell align="right">{r.sessions}</Table.Cell>
  <Table.Cell align="right"><ChevronRight size={16} /></Table.Cell>
</Table.Row>`,
    },
    {
      id: 'row-actions',
      title: 'Row actions',
      description: 'A per-row `Menu` in a trailing `srOnly` cell, the pattern for when each row has several verbs. The row itself is **not** a button; the `IconButton` trigger is. `Menu` portals out, so the table\'s scroll region never clips it.',
      code: `<Table.HeaderCell srOnly width={44}>Actions</Table.HeaderCell>
…
<Table.Cell align="right">
  <Menu
    trigger={<IconButton label={\`Ações de \${r.name}\`} size="sm"><MoreHorizontal size={16} /></IconButton>}
    items={[
      { label: 'Editar', icon: <Pencil size={16} />, onClick: () => edit(r) },
      { label: 'Duplicar', icon: <Copy size={16} />, onClick: () => dup(r) },
      { separator: true },
      { label: 'Excluir', icon: <Trash2 size={16} />, tone: 'danger', onClick: () => del(r) },
    ]}
  />
</Table.Cell>`,
    },
    {
      id: 'compact-sticky',
      title: 'Compact + sticky header',
      description: '`density="compact"` for CRM density; `stickyHeader` + `maxHeight` pin the head inside a bounded scroll region; `zebra` for faint striping on long lists.',
      code: `<Table caption="Transactions" density="compact" stickyHeader maxHeight={220} zebra>
  …
</Table>`,
    },
    {
      id: 'empty',
      title: 'Empty state',
      description: 'The table has no built-in empty slot, the screen swaps in an `EmptyState` when `rows.length === 0`. Keeps the contract small.',
      code: `{rows.length === 0
  ? <EmptyState icon={<Search />} title="No clients" description="…" />
  : <Table caption="Clients">…</Table>}`,
    },
  ],
  guidelines: {
    do: [
      'Always set `caption`; it’s the accessible name for the table and its scroll region.',
      'Sort the `rows` in the consumer and pass them back; `sort` is display-only.',
      '`compact` for CRM / reports, `comfortable` everywhere else. Right-align numeric columns.',
      'Set `minWidth` on multi-column tables: the region scrolls sideways on a phone instead of the text crushing.',
      'For several verbs per row, a `Menu` in a trailing `srOnly` cell, not a clickable row.',
    ],
    dont: [
      'Nesting an interactive control in a clickable row (`onClick` on `Table.Row` **and** a `<button>` cell), pick one.',
      'Expecting the `Table` to sort, filter or paginate for you. Slice the rows yourself and pair it with `Pagination`.',
      'Putting the `Table` in a flex / grid track without `min-width: 0` on the track: the `minWidth` will push the *page* wide instead of the region.',
    ],
  },
};
