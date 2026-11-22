'use client';

import {
  Badge,
  EmptyState,
  IconButton,
  Menu,
  Table,
  type TableSort,
  ToastProvider,
  useToast,
} from '@sereno-ds/ui';
import * as React from 'react';
import {
  ChevronRight,
  Copy,
  MoreHorizontal,
  Pencil,
  Search,
  Trash2,
} from 'lucide-react';
import { Plan, STATUS_LABEL, col } from './_shared';

const PLAN_ROWS: Plan[] = [
  { id: 'p1', name: 'Marina Alves', sessions: 12, price: 'R$ 2.160', status: 'success' },
  { id: 'p2', name: 'Carlos Dias', sessions: 1, price: 'R$ 180', status: 'warning' },
  { id: 'p3', name: 'Juliana Prado', sessions: 7, price: 'R$ 1.260', status: 'success' },
  { id: 'p4', name: 'Helena Costa', sessions: 3, price: 'R$ 540', status: 'error' },
];

function TableBasico() {
  return (
    <Table caption="Clients">
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Client</Table.HeaderCell>
          <Table.HeaderCell align="right">Sessions</Table.HeaderCell>
          <Table.HeaderCell align="right">Total</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {PLAN_ROWS.map((r) => (
          <Table.Row key={r.id}>
            <Table.Cell>{r.name}</Table.Cell>
            <Table.Cell align="right">{r.sessions}</Table.Cell>
            <Table.Cell align="right">{r.price}</Table.Cell>
            <Table.Cell>
              <Badge tone={r.status}>{STATUS_LABEL[r.status]}</Badge>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}

function TableSortable() {
  const [sort, setSort] = React.useState<TableSort | null>({ key: 'name', direction: 'asc' });
  const rows = React.useMemo(() => {
    if (!sort) return PLAN_ROWS;
    const dir = sort.direction === 'asc' ? 1 : -1;
    return [...PLAN_ROWS].sort((a, b) => {
      const av = a[sort.key as keyof Plan];
      const bv = b[sort.key as keyof Plan];
      return (typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv), 'en')) * dir;
    });
  }, [sort]);
  return (
    <Table caption="Clients">
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell sortKey="name" sort={sort} onSort={setSort}>Client</Table.HeaderCell>
          <Table.HeaderCell align="right" sortKey="sessions" sort={sort} onSort={setSort}>Sessions</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {rows.map((r) => (
          <Table.Row key={r.id}>
            <Table.Cell>{r.name}</Table.Cell>
            <Table.Cell align="right">{r.sessions}</Table.Cell>
            <Table.Cell>
              <Badge tone={r.status}>{STATUS_LABEL[r.status]}</Badge>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}

function TableClicavel() {
  const [selected, setSelected] = React.useState<string | null>('p1');
  return (
    <Table caption="Clients">
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Client</Table.HeaderCell>
          <Table.HeaderCell align="right">Sessions</Table.HeaderCell>
          <Table.HeaderCell srOnly>Open</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {PLAN_ROWS.map((r) => (
          <Table.Row key={r.id} selected={r.id === selected} onClick={() => setSelected(r.id)}>
            <Table.Cell>{r.name}</Table.Cell>
            <Table.Cell align="right">{r.sessions}</Table.Cell>
            <Table.Cell align="right">
              <ChevronRight size={16} strokeWidth={2} style={{ color: 'var(--text-muted)', verticalAlign: 'middle' }} />
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}

function TableRowActionsInner() {
  const { toast } = useToast();
  return (
    <Table caption="Clients" minWidth={420}>
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Client</Table.HeaderCell>
          <Table.HeaderCell align="right">Sessions</Table.HeaderCell>
          <Table.HeaderCell srOnly width={44}>
            Actions
          </Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {PLAN_ROWS.map((r) => (
          <Table.Row key={r.id}>
            <Table.Cell>{r.name}</Table.Cell>
            <Table.Cell align="right">{r.sessions}</Table.Cell>
            <Table.Cell align="right">
              <Menu
                trigger={
                  <IconButton label={`Ações de ${r.name}`} size="sm">
                    <MoreHorizontal size={16} strokeWidth={1.75} />
                  </IconButton>
                }
                items={[
                  { label: 'Editar', icon: <Pencil size={16} strokeWidth={1.75} />, onClick: () => toast(`Editando ${r.name}`) },
                  { label: 'Duplicar', icon: <Copy size={16} strokeWidth={1.75} />, onClick: () => toast(`${r.name} duplicado`) },
                  { separator: true },
                  { label: 'Excluir', icon: <Trash2 size={16} strokeWidth={1.75} />, tone: 'danger', onClick: () => toast.error(`${r.name} excluído`) },
                ]}
              />
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}

function TableRowActions() {
  return (
    <ToastProvider>
      <TableRowActionsInner />
    </ToastProvider>
  );
}

function TableCompactSticky() {
  const many = Array.from({ length: 14 }, (_, i) => PLAN_ROWS[i % PLAN_ROWS.length]);
  return (
    <Table caption="Transactions" density="compact" stickyHeader maxHeight={220} zebra>
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Client</Table.HeaderCell>
          <Table.HeaderCell align="right">Sessions</Table.HeaderCell>
          <Table.HeaderCell align="right">Total</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {many.map((r, i) => (
          <Table.Row key={i}>
            <Table.Cell>{r.name}</Table.Cell>
            <Table.Cell align="right">{r.sessions}</Table.Cell>
            <Table.Cell align="right">{r.price}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}

function TableVazia() {
  return (
    <div style={{ ...col, gap: 12 }}>
      <EmptyState icon={<Search size={22} strokeWidth={1.75} />} title="No clients" description="The table has no built-in empty slot, the screen swaps in an EmptyState when there are no rows." />
    </div>
  );
}

export const tableDemos: Record<string, React.FC> = {
    basic: TableBasico,
    sortable: TableSortable,
    interactive: TableClicavel,
    'row-actions': TableRowActions,
    'compact-sticky': TableCompactSticky,
    empty: TableVazia,
  };
