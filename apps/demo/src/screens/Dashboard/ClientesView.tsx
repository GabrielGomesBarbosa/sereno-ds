'use client';

import * as React from 'react';
import { ChevronRight, Clock, Download, Search } from 'lucide-react';
import { Avatar, Badge, Button, Card, Dialog, EmptyState, Pagination, type PaginationLabels, SearchInput, Select, Table, Tabs, type TableSort, Typography } from '@sereno-ds/ui';
import { AppointmentCard } from '@/domain/AppointmentCard';
import { WhatsAppButton } from '@/domain/WhatsAppButton';
import { AGENDA_SCHEDULE, CLIENTS, CLIENT_STATUS_LABEL, type ClientRow } from '@/lib/mock';
import { vcol, ComingSoon, ViewHeader } from './shared';

/**
 * A client's profile — Tabs' real-world use case for the `underline`
 * variant: page-level sections inside one view, not a filter. `Tabs.Panel`
 * does the section switch here instead of the screen hand-rolling it.
 */
function ClientDetailDialog({ client, onClose }: { client: ClientRow; onClose: () => void }) {
  const [tab, setTab] = React.useState('geral');

  const history = React.useMemo(() => AGENDA_SCHEDULE.flatMap((g) => g.items.filter((a) => a.client === client.name)), [client.name]);

  return (
    <Dialog size="lg" dividers onClose={onClose}>
      <Dialog.Header title={client.name}>
        <Badge tone={client.status} style={{ alignSelf: 'flex-start' }}>
          {CLIENT_STATUS_LABEL[client.status]}
        </Badge>
        <WhatsAppButton
          phone={client.phone}
          message={`Olá, ${client.name.split(' ')[0]}! `}
          label="Conversar no WhatsApp"
          style={{ alignSelf: 'flex-start' }}
        />
        <Dialog.Close />
      </Dialog.Header>
      <Dialog.Body>
        <Tabs value={tab} onChange={setTab}>
          <Tabs.List>
            <Tabs.Tab value="geral">Visão geral</Tabs.Tab>
            <Tabs.Tab value="historico" count={history.length || undefined}>
              Histórico
            </Tabs.Tab>
            <Tabs.Tab value="documentos">Documentos</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="geral" style={{ paddingTop: 'var(--space-4)' }}>
            <div style={vcol('var(--space-3)')}>
              <Card padding="md" style={vcol('var(--space-2)')}>
                {[
                  ['Sessões', client.sessions],
                  ['Última atividade', client.last],
                  ['Status', CLIENT_STATUS_LABEL[client.status]],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
                    <Typography variant="bodySm" color="muted">
                      {label}
                    </Typography>
                    <Typography variant="h3" style={{ fontSize: 'var(--text-sm)' }}>
                      {value}
                    </Typography>
                  </div>
                ))}
              </Card>
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="historico" style={{ paddingTop: 'var(--space-4)' }}>
            {history.length === 0 ? (
              <EmptyState icon={<Clock size={22} strokeWidth={1.75} />} title="Sem sessões registradas" description="Essa semana de exemplo não tem nenhuma sessão para este cliente." />
            ) : (
              <div style={vcol('var(--space-2)')}>
                {history.map((a, i) => (
                  <AppointmentCard key={a.date + a.time + i} compact client={a.client} service={a.service} time={a.time} date={a.date} channel={a.channel} status={a.status} />
                ))}
              </div>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="documentos" style={{ paddingTop: 'var(--space-4)' }}>
            <ComingSoon label="Documentos" />
          </Tabs.Panel>
        </Tabs>
      </Dialog.Body>
    </Dialog>
  );
}

const PAGE_SIZE = 8;

const PAGINATION_LABELS: Partial<PaginationLabels> = {
  navigation: 'Paginação de clientes',
  first: 'Primeira página',
  previous: 'Página anterior',
  next: 'Próxima página',
  last: 'Última página',
  page: (n) => `Página ${n}`,
  status: (n, total) => `Página ${n} de ${total}`,
};

export function ClientesView() {
  const [query, setQuery] = React.useState('');
  const [sort, setSort] = React.useState<TableSort | null>({ key: 'name', direction: 'asc' });
  const [page, setPage] = React.useState(1);
  const [openClient, setOpenClient] = React.useState<ClientRow | null>(null);
  const q = query.trim().toLowerCase();

  // The DS never reorders the rows — the screen sorts and hands the result back.
  const rows = React.useMemo(() => {
    const filtered = q ? CLIENTS.filter((c) => c.name.toLowerCase().includes(q)) : [...CLIENTS];
    if (!sort) return filtered;
    const dir = sort.direction === 'asc' ? 1 : -1;
    const key = sort.key as keyof ClientRow;
    return [...filtered].sort((a, b) => String(a[key]).localeCompare(String(b[key]), 'pt-BR') * dir);
  }, [q, sort]);

  // A different search or order is a different list: back to its first page. `page` is also
  // clamped for display, so it can never point past the end of a shorter list.
  const changeQuery = (value: string) => {
    setQuery(value);
    setPage(1);
  };
  const changeSort = (next: TableSort) => {
    setSort(next);
    setPage(1);
  };
  const pageCount = Math.ceil(rows.length / PAGE_SIZE);
  const current = Math.min(page, Math.max(pageCount, 1));
  const start = (current - 1) * PAGE_SIZE;
  const visible = rows.slice(start, start + PAGE_SIZE);

  return (
    <div style={vcol('var(--space-4)')}>
      <ViewHeader action={<Button variant="secondary" iconLeft={<Download size={18} strokeWidth={1.75} />}>Exportar</Button>} />
      <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <SearchInput
          placeholder="Buscar cliente"
          clearLabel="Limpar busca"
          onSearch={changeQuery}
          onValueChange={changeQuery}
          containerStyle={{ flex: 1, minWidth: 220, maxWidth: 340 }}
        />
        <Select defaultValue="all" options={[{ value: 'all', label: 'Todos os status' }, { value: 'ativo', label: 'Ativos' }]} containerStyle={{ width: 200 }} />
      </div>
      {rows.length === 0 ? (
        <EmptyState icon={<Search size={22} strokeWidth={1.75} />} title="Nenhum cliente encontrado" description={`Nada para "${query.trim()}". Tente outro nome.`} />
      ) : (
        <Table caption="Clientes" minWidth={460}>
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell sortKey="name" sort={sort} onSort={changeSort}>Cliente</Table.HeaderCell>
              <Table.HeaderCell>Histórico</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell srOnly width={44}>Abrir</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {visible.map((c) => (
              <Table.Row key={c.name} selected={c.name === openClient?.name} onClick={() => setOpenClient(c)}>
                <Table.Cell>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <Avatar name={c.name} size="sm" />
                    <Typography variant="h3" style={{ fontSize: 'var(--text-sm)' }}>
                      {c.name}
                    </Typography>
                  </span>
                </Table.Cell>
                <Table.Cell>
                  <Typography variant="bodySm">
                    {c.sessions} · {c.last}
                  </Typography>
                </Table.Cell>
                <Table.Cell>
                  <Badge tone={c.status}>{CLIENT_STATUS_LABEL[c.status]}</Badge>
                </Table.Cell>
                <Table.Cell align="right">
                  <ChevronRight size={16} strokeWidth={2} style={{ color: 'var(--text-muted)', verticalAlign: 'middle' }} />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
      {rows.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
          <Typography variant="bodySm" color="muted">
            {pageCount > 1 ? `Mostrando ${start + 1} a ${start + visible.length} de ${rows.length}` : `${rows.length} ${rows.length === 1 ? 'cliente' : 'clientes'}`}
          </Typography>
          {pageCount > 1 && <Pagination page={current} pageCount={pageCount} onPageChange={setPage} labels={PAGINATION_LABELS} />}
        </div>
      )}

      {openClient && <ClientDetailDialog client={openClient} onClose={() => setOpenClient(null)} />}
    </div>
  );
}
