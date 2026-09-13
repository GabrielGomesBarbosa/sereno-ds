'use client';

import * as React from 'react';
import { ChevronRight, Clock, Download, Search } from 'lucide-react';
import { Avatar, Badge, Button, Card, Dialog, EmptyState, SearchInput, Select, Table, Tabs, type TableSort } from '@sereno-ds/ui';
import { AppointmentCard } from '@/domain/AppointmentCard';
import { AGENDA_SCHEDULE, CLIENTS, CLIENT_STATUS_LABEL, type ClientRow } from '@/lib/mock';
import { cardTitle, vcol, ComingSoon, ViewHeader } from './shared';

/**
 * A client's profile — Tabs' real-world use case for the `underline`
 * variant: page-level sections inside one view, not a filter. `Tabs.Panel`
 * does the section switch here instead of the screen hand-rolling it.
 */
function ClientDetailDialog({ client, onClose }: { client: ClientRow; onClose: () => void }) {
  const [tab, setTab] = React.useState('geral');

  const history = React.useMemo(() => AGENDA_SCHEDULE.flatMap((g) => g.items.filter((a) => a.client === client.name)), [client.name]);

  return (
    <Dialog size="lg" title={client.name} description={CLIENT_STATUS_LABEL[client.status]} dividers showClose onClose={onClose}>
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
                  <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                  <span style={{ ...cardTitle, fontSize: 'var(--text-sm)' }}>{value}</span>
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
    </Dialog>
  );
}

export function ClientesView() {
  const [query, setQuery] = React.useState('');
  const [sort, setSort] = React.useState<TableSort | null>({ key: 'name', direction: 'asc' });
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

  return (
    <div style={vcol('var(--space-4)')}>
      <ViewHeader action={<Button variant="secondary" iconLeft={<Download size={18} strokeWidth={1.75} />}>Exportar</Button>} />
      <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <SearchInput
          placeholder="Buscar cliente"
          clearLabel="Limpar busca"
          onSearch={setQuery}
          onValueChange={setQuery}
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
              <Table.HeaderCell sortKey="name" sort={sort} onSort={setSort}>Cliente</Table.HeaderCell>
              <Table.HeaderCell>Histórico</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell srOnly width={44}>Abrir</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {rows.map((c) => (
              <Table.Row key={c.name} selected={c.name === openClient?.name} onClick={() => setOpenClient(c)}>
                <Table.Cell>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <Avatar name={c.name} size="sm" />
                    <span style={{ ...cardTitle, fontSize: 'var(--text-sm)' }}>{c.name}</span>
                  </span>
                </Table.Cell>
                <Table.Cell>
                  <span style={{ color: 'var(--text-secondary)' }}>{c.sessions} · {c.last}</span>
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

      {openClient && <ClientDetailDialog client={openClient} onClose={() => setOpenClient(null)} />}
    </div>
  );
}
