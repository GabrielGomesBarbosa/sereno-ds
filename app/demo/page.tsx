import type { Metadata } from 'next';
import Link from 'next/link';
import { ThemeToggle } from '@/theme/ThemeToggle';

export const metadata: Metadata = {
  title: 'Aplicação — telas de demonstração',
  description: 'As três telas reais da plataforma Sereno construídas com o Design System, navegáveis com dados mockados.',
  alternates: { canonical: '/demo' },
};

const SCREENS = [
  {
    href: '/agendar/ana-ramos',
    kicker: 'Fluxo público',
    title: 'Agendamento do cliente',
    body: 'O cliente abre o link do profissional, escolhe o serviço, a data e o horário, deixa os dados e confirma. Mobile-first, sem cadastro.',
  },
  {
    href: '/dashboard',
    kicker: 'Área logada',
    title: 'Dashboard do profissional',
    body: 'Agenda do dia, clientes, catálogo de serviços, financeiro e configurações — incluindo a grade horária semanal.',
  },
  {
    href: '/onboarding',
    kicker: 'Primeiro acesso',
    title: 'Onboarding em 3 passos',
    body: 'Perfil, primeiro serviço e grade horária. Ao final, o link público já aceita agendamentos.',
  },
];

export default function DemoHub() {
  return (
    <main style={{ minHeight: '100dvh', background: 'var(--bg-canvas)' }}>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-4)',
          height: 'var(--topbar-height)',
          padding: '0 var(--gutter-desktop)',
          background: 'color-mix(in srgb, var(--bg-surface) 88%, transparent)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-default)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)' }}>
          <Link
            href="/"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-lg)', letterSpacing: '-0.03em', color: 'var(--text-brand)', textDecoration: 'none' }}
          >
            Sereno
          </Link>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Aplicação</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Link
            href="/design-system"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              height: 'var(--control-height-sm)',
              padding: '0 var(--space-4)',
              borderRadius: 'var(--radius-control)',
              background: 'var(--bg-brand-soft)',
              color: 'var(--text-brand)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Design System
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div
        style={{
          maxWidth: 'var(--container-content)',
          margin: '0 auto',
          padding: 'var(--space-9) var(--gutter-desktop) var(--space-11)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-7)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: 0 }}>
            Telas de demonstração
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-md)', lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0, maxWidth: 560 }}>
            As três telas reais do produto, construídas com as primitivas do Design System e navegáveis fim a fim com dados
            mockados.
          </p>
        </div>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
          {SCREENS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
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
                {s.kicker}
              </span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)' }}>{s.title}</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', lineHeight: 1.55, color: 'var(--text-secondary)' }}>{s.body}</span>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
