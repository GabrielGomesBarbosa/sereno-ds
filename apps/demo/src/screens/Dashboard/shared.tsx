import * as React from 'react';
import { BarChart3, Sparkles } from 'lucide-react';
import { Card, EmptyState } from '@sereno-ds/ui';
import { cardTitle, vcol } from '@/domain/layout';

/** Small pieces every Dashboard view reaches for — layout helpers, the shared
 * "not built yet" placeholder, and the one hook used both here and by the shell. */

export { cardTitle, vcol };

export function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false);
  React.useEffect(() => {
    const m = window.matchMedia(query);
    const sync = () => setMatches(m.matches);
    sync();
    m.addEventListener('change', sync);
    return () => m.removeEventListener('change', sync);
  }, [query]);
  return matches;
}

export function ViewHeader({ title, action }: { title?: string; action?: React.ReactNode }) {
  if (!title && !action) return null;
  return (
    <div style={{ display: 'flex', justifyContent: title ? 'space-between' : 'flex-end', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
      {title && <h2 style={{ ...cardTitle, fontSize: 'var(--text-lg)', margin: 0, letterSpacing: '-0.01em' }}>{title}</h2>}
      {action}
    </div>
  );
}

const bigNumber: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 'var(--text-3xl)',
  fontWeight: 800,
  letterSpacing: '-0.02em',
  color: 'var(--text-primary)',
  lineHeight: 1.1,
};

export function Stat({ label, value, delta, tone }: { label: string; value: string; delta?: string; tone?: 'up' }) {
  return (
    <Card padding="md" style={{ minWidth: 0, ...vcol('4px') }}>
      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</span>
      <span style={bigNumber}>{value}</span>
      {delta && <span style={{ fontSize: 'var(--text-xs)', color: tone === 'up' ? 'var(--status-success-fg)' : 'var(--text-muted)', fontWeight: 500 }}>{delta}</span>}
    </Card>
  );
}

/** The flex-wrap row every `Stat` group sits in — Agenda, Financeiro, Relatórios. */
export function StatRow({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>{children}</div>;
}

/** The DS-boundary placeholder — a section whose real flow isn't built yet. */
export function ComingSoon({ label }: { label: string }) {
  return (
    <Card padding="none">
      <EmptyState
        icon={<Sparkles size={22} strokeWidth={1.75} />}
        title={`${label} — em breve`}
        description="Esta área ainda não faz parte deste design system; entra quando o fluxo for definido."
      />
    </Card>
  );
}

/** Same placeholder, sized as a full view — the fallback for any nav destination with no screen yet. */
export function ComingSoonView({ title }: { title: string }) {
  return (
    <div style={{ ...vcol('var(--space-5)'), maxWidth: 760 }}>
      <ComingSoon label={title} />
    </div>
  );
}

/** The revenue/occupancy chart placeholder — Financeiro › Resumo and Relatórios both point here. */
export function ChartsComingSoon({ title }: { title: string }) {
  return (
    <Card padding="none">
      <EmptyState
        icon={<BarChart3 size={22} strokeWidth={1.75} />}
        title={title}
        description="Os gráficos de receita e ocupação ainda não fazem parte deste design system — deixado propositalmente em branco."
      />
    </Card>
  );
}
