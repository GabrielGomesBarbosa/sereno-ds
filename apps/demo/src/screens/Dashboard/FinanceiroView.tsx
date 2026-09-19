import { Avatar, Badge, Table, Typography } from '@sereno-ds/ui';
import { CLIENTS } from '@/lib/mock';
import { vcol, ChartsComingSoon, ComingSoon, Stat, StatRow, ViewHeader } from './shared';
import { KNOWN_FINANCE } from './constants';

const PENDING_PAYMENTS = CLIENTS.slice(0, 4).map((c, i) => ({
  name: c.name,
  service: i % 2 ? 'Primeira consulta' : 'Sessão de psicoterapia',
  amount: i % 2 ? 'R$ 220' : 'R$ 180',
  due: ['vence hoje', 'vence em 2 dias', 'vence em 5 dias', 'atrasado 3 dias'][i],
  late: i === 3,
}));

export function FinanceiroView({ section, title }: { section: string; title: string }) {
  return (
    <div style={vcol('var(--space-5)')}>
      <StatRow>
        <Stat label="Recebido em agosto" value="R$ 4.180" delta="+12% vs. julho" tone="up" />
        <Stat label="A receber" value="R$ 860" delta="4 atendimentos" />
        <Stat label="Ticket médio" value="R$ 196" />
      </StatRow>
      {!KNOWN_FINANCE.has(section) ? (
        <ComingSoon label={title} />
      ) : section === 'resumo' ? (
        <ChartsComingSoon title="Gráficos de receita em breve" />
      ) : (
        <>
          <ViewHeader title="Pagamentos pendentes" />
          <Table caption="Pagamentos pendentes" minWidth={440}>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>Cliente</Table.HeaderCell>
                <Table.HeaderCell align="right">Valor</Table.HeaderCell>
                <Table.HeaderCell>Vencimento</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {PENDING_PAYMENTS.map((p) => (
                <Table.Row key={p.name}>
                  <Table.Cell>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <Avatar name={p.name} size="sm" />
                      <span style={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h3" style={{ fontSize: 'var(--text-sm)' }}>
                          {p.name}
                        </Typography>
                        <Typography variant="caption" color="secondary">
                          {p.service}
                        </Typography>
                      </span>
                    </span>
                  </Table.Cell>
                  <Table.Cell align="right">
                    <Typography variant="h3" style={{ fontSize: 'var(--text-sm)' }}>
                      {p.amount}
                    </Typography>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge tone={p.late ? 'error' : 'warning'}>{p.due}</Badge>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </>
      )}
    </div>
  );
}
