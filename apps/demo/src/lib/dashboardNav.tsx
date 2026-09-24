import * as React from 'react';
import {
  BarChart3,
  Calendar,
  CalendarOff,
  Clock,
  FileText,
  Gift,
  Heart,
  LifeBuoy,
  Link2,
  Megaphone,
  MessageSquare,
  Package,
  Percent,
  Rss,
  Settings,
  Share2,
  Sparkles,
  Star,
  Target,
  Ticket,
  UserCog,
  Users,
  Wallet,
} from 'lucide-react';

/**
 * The Dashboard screen's nav data — the single source for what `SidebarNav`
 * renders (in `Dashboard.tsx`, a client component) and for which routes
 * `app/dashboard/[[...slug]]/page.tsx` (a server component) must pre-render
 * as static HTML. Kept in a plain module, no `'use client'`, so both sides
 * of that boundary can import it.
 */

const si = (icon: React.ReactNode) => icon;

export interface SidebarSubItem {
  value: string;
  label: string;
  count?: number;
  /** Locked on the free plan — shown in the menu, not selectable. */
  disabled?: boolean;
}
export interface SidebarItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
  /** Locked on the free plan — shown in the menu, not selectable. */
  disabled?: boolean;
  children?: SidebarSubItem[];
}
export interface SidebarSection {
  label?: string;
  items: SidebarItem[];
}

export const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    label: 'Atendimento',
    items: [
      { value: 'agenda', label: 'Agenda', icon: si(<Calendar size={18} strokeWidth={1.75} />) },
      { value: 'clientes', label: 'Clientes', icon: si(<Users size={18} strokeWidth={1.75} />), count: 128 },
      { value: 'servicos', label: 'Serviços', icon: si(<Sparkles size={18} strokeWidth={1.75} />) },
      { value: 'mensagens', label: 'Mensagens', icon: si(<MessageSquare size={18} strokeWidth={1.75} />), count: 3 },
      { value: 'fila', label: 'Fila de espera', icon: si(<Clock size={18} strokeWidth={1.75} />), count: 2 },
      { value: 'prontuarios', label: 'Prontuários', icon: si(<FileText size={18} strokeWidth={1.75} />) },
      { value: 'bloqueios', label: 'Bloqueios', icon: si(<CalendarOff size={18} strokeWidth={1.75} />) },
    ],
  },
  {
    label: 'Gestão',
    items: [
      {
        value: 'financeiro',
        label: 'Financeiro',
        icon: si(<Wallet size={18} strokeWidth={1.75} />),
        children: [
          { value: 'financeiro:resumo', label: 'Resumo do mês' },
          { value: 'financeiro:receber', label: 'A receber', count: 4 },
          { value: 'financeiro:pagamentos', label: 'Pagamentos' },
          { value: 'financeiro:repasses', label: 'Repasses' },
          { value: 'financeiro:notas', label: 'Notas fiscais' },
        ],
      },
      { value: 'comissoes', label: 'Comissões', icon: si(<Percent size={18} strokeWidth={1.75} />) },
      { value: 'estoque', label: 'Estoque', icon: si(<Package size={18} strokeWidth={1.75} />) },
      { value: 'metas', label: 'Metas', icon: si(<Target size={18} strokeWidth={1.75} />) },
      { value: 'relatorios', label: 'Relatórios', icon: si(<BarChart3 size={18} strokeWidth={1.75} />) },
      { value: 'avaliacoes', label: 'Avaliações', icon: si(<Star size={18} strokeWidth={1.75} />), count: 12 },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { value: 'link-publico', label: 'Link público', icon: si(<Link2 size={18} strokeWidth={1.75} />) },
      { value: 'campanhas', label: 'Campanhas', icon: si(<Megaphone size={18} strokeWidth={1.75} />), disabled: true },
      { value: 'cupons', label: 'Cupons', icon: si(<Ticket size={18} strokeWidth={1.75} />) },
      { value: 'indicacoes', label: 'Programa de indicação', icon: si(<Gift size={18} strokeWidth={1.75} />) },
      { value: 'fidelidade', label: 'Fidelidade', icon: si(<Heart size={18} strokeWidth={1.75} />) },
      { value: 'redes', label: 'Redes sociais', icon: si(<Share2 size={18} strokeWidth={1.75} />) },
    ],
  },
  {
    label: 'Conta',
    items: [
      { value: 'equipe', label: 'Equipe', icon: si(<UserCog size={18} strokeWidth={1.75} />), count: 4 },
      {
        value: 'config',
        label: 'Configurações',
        icon: si(<Settings size={18} strokeWidth={1.75} />),
        children: [
          { value: 'config:perfil', label: 'Perfil público' },
          { value: 'config:grade', label: 'Grade horária' },
          { value: 'config:lembretes', label: 'Lembretes' },
          { value: 'config:notificacoes', label: 'Notificações' },
          { value: 'config:integracoes', label: 'Integrações' },
          { value: 'config:cobranca', label: 'Plano e cobrança' },
          { value: 'config:dominio', label: 'Domínio próprio', disabled: true },
        ],
      },
      { value: 'novidades', label: 'Novidades', icon: si(<Rss size={18} strokeWidth={1.75} />) },
      { value: 'ajuda', label: 'Ajuda e suporte', icon: si(<LifeBuoy size={18} strokeWidth={1.75} />) },
    ],
  },
];

/** Every navigable `value` — top-level items and their sub-items, flattened. */
export const DASHBOARD_VIEWS: string[] = SIDEBAR_SECTIONS.flatMap((s) =>
  s.items.flatMap((it) => [it.value, ...(it.children?.map((c) => c.value) ?? [])]),
);

/** `value` → its URL under `/dashboard` — colon-separated segments become slashes. */
export function pathForView(view: string): string {
  return `/dashboard/${view.split(':').join('/')}`;
}

/** The reverse of `pathForView`, read straight off `usePathname()`. No match ⇒ `'agenda'`. */
export function viewFromPathname(pathname: string): string {
  const slug = pathname.replace(/^\/dashboard\/?/, '').split('/').filter(Boolean);
  return slug.length ? slug.join(':') : 'agenda';
}

/** Page title from the nav data: leaf → its label, child → `Parent · Child`. */
export function titleForView(view: string): string {
  for (const s of SIDEBAR_SECTIONS) {
    for (const it of s.items) {
      if (it.value === view) return it.label;
      const c = it.children?.find((ch) => ch.value === view);
      if (c) return `${it.label} · ${c.label}`;
    }
  }
  return 'Sereno';
}
