import type { Metadata } from 'next';
import Link from 'next/link';
import { ThemeToggle } from '@/theme/ThemeToggle';

export const metadata: Metadata = {
  title: 'Sereno — agendamento online para profissionais de saúde e beleza',
  description:
    'Link público de agendamento, mobile-first e sem cadastro obrigatório, e um dashboard completo para o profissional gerir a agenda, clientes e serviços.',
  alternates: { canonical: '/' },
};

const ENTRIES = [
  {
    href: '/design-system',
    kicker: 'Componentes',
    title: 'Abrir o Design System',
    body: 'As 25 primitivas React, a página de tokens (claro × escuro) e a vitrine navegável com prévia ao vivo de cada componente.',
  },
  {
    href: '/demo',
    kicker: 'Produto',
    title: 'Ver a aplicação',
    body: 'As três telas reais — fluxo público de agendamento, dashboard do profissional e onboarding — navegáveis com dados mockados.',
  },
];

export default function Home() {
  return (
    <main style={{ minHeight: '100dvh', background: 'var(--bg-canvas)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ width: '100%', maxWidth: 'var(--container-content)', margin: '0 auto', padding: '0 var(--gutter-desktop)', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 'var(--topbar-height)' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-lg)', letterSpacing: '-0.03em', color: 'var(--text-brand)' }}>Sereno</span>
          <ThemeToggle />
        </header>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 'var(--space-7)', padding: 'var(--space-9) 0 var(--space-11)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: 0, lineHeight: 1.15 }}>
              Sereno
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-md)', lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0, maxWidth: 520 }}>
              Design System e vitrine da plataforma de agendamento para profissionais autônomos de saúde e beleza. Escolha por onde
              começar.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
            {ENTRIES.map((e) => (
              <Link
                key={e.href}
                href={e.href}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-5)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-card)',
                  boxShadow: 'var(--shadow-sm)',
                  textDecoration: 'none',
                }}
              >
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-2xs)', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  {e.kicker}
                </span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)' }}>{e.title}</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', lineHeight: 1.55, color: 'var(--text-secondary)' }}>{e.body}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
