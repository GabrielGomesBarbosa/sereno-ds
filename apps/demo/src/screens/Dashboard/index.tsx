'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu as MenuIcon, X } from 'lucide-react';
import { Brand, Button, Card, IconButton, SidebarNav, ThemeToggle, ToastProvider, TopBar, useToast } from '@sereno-ds/ui';
import { SIDEBAR_SECTIONS, pathForView, titleForView, viewFromPathname } from '@/lib/dashboardNav';
import { cardTitle, useMediaQuery, vcol } from './shared';
import { KNOWN_BASES, todayLabel } from './constants';
import { NotificationsMenu, UserMenu } from './TopBarMenus';
import { AgendaView } from './AgendaView';
import { ClientesView } from './ClientesView';
import { ServicosView } from './ServicosView';
import { FinanceiroView } from './FinanceiroView';
import { RelatoriosView } from './RelatoriosView';
import { ConfigView } from './ConfigView';
import { ComingSoonView } from './shared';

/** `SIDEBAR_SECTIONS` mapped to `SidebarNav`'s compound children — shared by the
 * desktop rail and the mobile drawer below, each its own `<SidebarNav>`. */
function SidebarSections() {
  return (
    <>
      {SIDEBAR_SECTIONS.map((section, i) => (
        <SidebarNav.Section key={section.label ?? i} label={section.label}>
          {section.items.map((item) => (
            <SidebarNav.Item key={item.value} value={item.value} label={item.label} icon={item.icon} count={item.count}>
              {item.children?.map((sub) => (
                <SidebarNav.SubItem key={sub.value} value={sub.value} label={sub.label} count={sub.count} />
              ))}
            </SidebarNav.Item>
          ))}
        </SidebarNav.Section>
      ))}
    </>
  );
}

function DashboardShell() {
  const { toast } = useToast();
  const notify = React.useCallback((m: string) => toast.success(m), [toast]);
  // The view lives in the URL (not React state) so a direct visit or an F5
  // lands on the right screen with the right nav item — and branch — active.
  const pathname = usePathname();
  const router = useRouter();
  const view = viewFromPathname(pathname);
  const navigateTo = (v: string) => router.push(pathForView(v));
  const [navCollapsed, setNavCollapsed] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [drawerRender, setDrawerRender] = React.useState(false);
  const isNarrow = useMediaQuery('(max-width: 900px)');
  const openDrawer = () => {
    setDrawerRender(true);
    setDrawerOpen(true);
  };

  // Nav drawer (mobile/tablet): lock scroll + Esc to close; auto-close on desktop.
  React.useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawerOpen(false);
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [drawerOpen]);
  React.useEffect(() => {
    // the persistent sidebar is back — drop the drawer with no exit animation
    const resetDrawer = () => {
      setDrawerOpen(false);
      setDrawerRender(false);
    };
    if (!isNarrow) resetDrawer();
  }, [isNarrow]);
  React.useEffect(() => {
    // unmount after the slide-out animation
    if (drawerOpen || !drawerRender) return;
    const unmount = () => setDrawerRender(false);
    const t = window.setTimeout(unmount, 260);
    return () => window.clearTimeout(t);
  }, [drawerOpen, drawerRender]);

  const go = (v: string) => {
    navigateTo(v);
    setDrawerOpen(false);
  };

  const [base, sub] = view.split(':') as [string, string | undefined];
  const pageTitle = titleForView(view);

  const brandFull = <Brand variant="lockup" size={22} />;
  const planFooter = (
    <Card padding="sm" elevation="none" style={{ background: 'var(--bg-accent-soft)', ...vcol('6px') }}>
      <span style={{ ...cardTitle, fontSize: 'var(--text-sm)' }}>Plano gratuito</span>
      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.4 }}>18 de 20 agendamentos usados este mês.</span>
      <Button variant="accent" size="sm" fullWidth style={{ marginTop: 4 }} onClick={() => notify('Redirecionando para os planos…')}>
        Assinar agora
      </Button>
    </Card>
  );

  return (
    <div style={{ background: 'var(--bg-canvas)', minHeight: '100dvh', ['--dash-header-h' as string]: '74px' } as React.CSSProperties}>
      <div className="dash-shell" style={{ '--dash-sb-w': navCollapsed ? '72px' : '248px' } as React.CSSProperties}>
        <div className="dash-sidebar">
          <SidebarNav
            value={view}
            onChange={navigateTo}
            collapsed={navCollapsed}
            onCollapsedChange={setNavCollapsed}
            labels={{ expand: 'Expandir', collapse: 'Recolher' }}
            style={{ ['--sidenav-header-h' as string]: 'var(--dash-header-h)' } as React.CSSProperties}
            header={navCollapsed ? <Brand variant="symbol" size={26} /> : brandFull}
            footer={planFooter}
          >
            <SidebarSections />
          </SidebarNav>
        </div>

        <div className="dash-content">
          <TopBar
            title={pageTitle}
            subtitle={
              base === 'agenda' ? (
                <>
                  <span className="dash-date-full">{todayLabel(false)}</span>
                  <span className="dash-date-short">{todayLabel(true)}</span>
                </>
              ) : undefined
            }
            leading={
              <span className="dash-topbar-lead">
                <IconButton label="Abrir menu" variant="ghost" onClick={openDrawer}>
                  <MenuIcon size={20} strokeWidth={1.75} />
                </IconButton>
              </span>
            }
            style={{
              height: 'var(--dash-header-h)',
              flex: '0 0 auto',
              background: 'var(--bg-surface)',
              backdropFilter: 'none',
              // Align the bar's content to the centered .dash-main column (its
              // max-width gutter + its own inner padding).
              paddingInline: 'max(var(--dash-gutter), calc((100% - var(--container-app)) / 2 + var(--dash-gutter)))',
            }}
            actions={
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                {/* Hidden via CSS (not JS) below 900px so it can't flash on reload — the
                    toggle moves into the avatar menu there. See .dash-topbar-theme. */}
                <span className="dash-topbar-theme">
                  <ThemeToggle variant="ghost" />
                </span>
                <NotificationsMenu onToast={notify} />
                <span style={{ width: 1, height: 24, background: 'var(--border-default)', margin: '0 var(--space-1)' }} />
                <UserMenu onNavigate={navigateTo} onToast={notify} />
              </div>
            }
          />
          <main className="dash-main">
            {base === 'agenda' && <AgendaView onToast={notify} />}
            {base === 'clientes' && <ClientesView />}
            {base === 'servicos' && <ServicosView />}
            {base === 'financeiro' && <FinanceiroView section={sub ?? 'resumo'} title={pageTitle} />}
            {base === 'relatorios' && <RelatoriosView />}
            {base === 'config' && <ConfigView section={sub ?? 'perfil'} title={pageTitle} />}
            {!KNOWN_BASES.has(base) && <ComingSoonView title={pageTitle} />}
          </main>
        </div>
      </div>

      {isNarrow && drawerRender && (
        <>
          <div className="dash-drawer-scrim" data-closing={!drawerOpen || undefined} onClick={() => setDrawerOpen(false)} />
          <aside className="dash-drawer" aria-label="Menu" data-closing={!drawerOpen || undefined}>
            <span className="dash-drawer-close">
              <IconButton label="Fechar menu" variant="ghost" onClick={() => setDrawerOpen(false)}>
                <X size={20} strokeWidth={1.75} />
              </IconButton>
            </span>
            <SidebarNav
              collapsible={false}
              value={view}
              onChange={go}
              header={brandFull}
              footer={planFooter}
              style={{ width: '100%', borderRight: 'none', ['--sidenav-header-h' as string]: 'var(--dash-header-h)' } as React.CSSProperties}
            >
              <SidebarSections />
            </SidebarNav>
          </aside>
        </>
      )}
    </div>
  );
}

export function Dashboard() {
  return (
    <ToastProvider position="top-right">
      <DashboardShell />
    </ToastProvider>
  );
}
