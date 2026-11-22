'use client';

import * as React from 'react';
import { Badge, Pagination, Table } from '@sereno-ds/ui';
import { Plan, STATUS_LABEL, col } from './_shared';

const PAGINATION_FIRST = ['Marina', 'Carlos', 'Juliana', 'Helena', 'Rafael', 'Beatriz', 'Lucas', 'Camila', 'Pedro', 'Sofia'];

const PAGINATION_LAST = ['Alves', 'Dias', 'Prado', 'Costa', 'Lima', 'Nunes', 'Rocha', 'Freitas'];

const PAGINATION_STATUS: Plan['status'][] = ['success', 'warning', 'error'];

/** 47 mock clients, so five per page gives ten pages: enough for the ellipsis to show. */
const PAGINATION_ROWS: Plan[] = Array.from({ length: 47 }, (_, i) => {
  const sessions = ((i * 7) % 15) + 1;
  return {
    id: `c${i}`,
    name: `${PAGINATION_FIRST[i % PAGINATION_FIRST.length]} ${PAGINATION_LAST[(i * 3) % PAGINATION_LAST.length]}`,
    sessions,
    price: `R$ ${sessions * 180}`,
    status: PAGINATION_STATUS[i % 3],
  };
});

function PaginationBasico() {
  const [page, setPage] = React.useState(1);
  return (
    <div style={col}>
      <Pagination page={page} pageCount={20} onPageChange={setPage} />
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Current page: {page}</span>
    </div>
  );
}

function PaginationComTabela() {
  const [page, setPage] = React.useState(1);
  const pageSize = 5;
  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, PAGINATION_ROWS.length);
  return (
    <div style={{ ...col, width: '100%' }}>
      <Table caption="Clients" minWidth={420}>
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Client</Table.HeaderCell>
            <Table.HeaderCell align="right">Sessions</Table.HeaderCell>
            <Table.HeaderCell align="right">Total</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {PAGINATION_ROWS.slice(start, end).map((r) => (
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
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          Showing {start + 1} to {end} of {PAGINATION_ROWS.length}
        </span>
        <Pagination page={page} pageCount={Math.ceil(PAGINATION_ROWS.length / pageSize)} onPageChange={setPage} />
      </div>
    </div>
  );
}

function PaginationBordas() {
  const [page, setPage] = React.useState(30);
  return <Pagination page={page} pageCount={60} showEdges siblingCount={2} onPageChange={setPage} />;
}

function PaginationTamanhos() {
  const [page, setPage] = React.useState(4);
  return (
    <div style={{ ...col, gap: 16 }}>
      <Pagination size="sm" page={page} pageCount={12} onPageChange={setPage} />
      <Pagination size="md" page={page} pageCount={12} onPageChange={setPage} />
      <Pagination size="lg" page={page} pageCount={12} onPageChange={setPage} />
    </div>
  );
}

function PaginationLocalizada() {
  const [page, setPage] = React.useState(3);
  return (
    <Pagination
      page={page}
      pageCount={12}
      onPageChange={setPage}
      labels={{
        navigation: 'Paginação',
        first: 'Primeira página',
        previous: 'Página anterior',
        next: 'Próxima página',
        last: 'Última página',
        page: (n) => `Página ${n}`,
        status: (n, total) => `Página ${n} de ${total}`,
      }}
    />
  );
}

function PaginationDesabilitada() {
  return <Pagination page={3} pageCount={12} onPageChange={() => {}} disabled />;
}

export const paginationDemos: Record<string, React.FC> = {
    basic: PaginationBasico,
    'with-table': PaginationComTabela,
    edges: PaginationBordas,
    sizes: PaginationTamanhos,
    labels: PaginationLocalizada,
    disabled: PaginationDesabilitada,
  };
