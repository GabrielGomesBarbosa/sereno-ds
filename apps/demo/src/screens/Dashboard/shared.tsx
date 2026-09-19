import * as React from 'react';
import { BarChart3, Sparkles } from 'lucide-react';
import { Card, EmptyState, Typography } from '@sereno-ds/ui';
import { vcol } from '@/domain/layout';

/** Small pieces every Dashboard view reaches for — layout helpers, the shared
 * "not built yet" placeholder, and the one hook used both here and by the shell. */

export { vcol };

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
      {title && (
        <Typography as="h2" variant="h3" style={{ fontSize: 'var(--text-lg)', letterSpacing: '-0.01em' }}>
          {title}
        </Typography>
      )}
      {action}
    </div>
  );
}

export function Stat({ label, value, delta, tone }: { label: string; value: string; delta?: string; tone?: 'up' }) {
  return (
    <Card padding="md" style={{ minWidth: 0, ...vcol('4px') }}>
      <Typography variant="eyebrow" style={{ fontSize: 'var(--text-xs)', letterSpacing: '0.05em' }}>
        {label}
      </Typography>
      <Typography as="span" variant="h1" style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, lineHeight: 1.1 }}>
        {value}
      </Typography>
      {delta && (
        <Typography variant="caption" style={{ fontWeight: 500, color: tone === 'up' ? 'var(--status-success-fg)' : undefined }}>
          {delta}
        </Typography>
      )}
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
