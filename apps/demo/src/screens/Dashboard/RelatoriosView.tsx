import { ChartsComingSoon, Stat, StatRow, vcol } from './shared';

export function RelatoriosView() {
  return (
    <div style={{ ...vcol('var(--space-5)'), maxWidth: 760 }}>
      <StatRow>
        <Stat label="Atendimentos no mês" value="72" delta="+8 vs. julho" tone="up" />
        <Stat label="Taxa de comparecimento" value="94%" />
        <Stat label="Novos clientes" value="11" />
      </StatRow>
      <ChartsComingSoon title="Relatórios em breve" />
    </div>
  );
}
