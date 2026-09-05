'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AlertTriangle,
  AppWindow,
  CalendarCheck,
  CalendarClock,
  CalendarRange,
  CheckSquare,
  ChevronsUpDown,
  CircleDot,
  CircleUserRound,
  Contact,
  ImageUp,
  Inbox,
  LayoutGrid,
  ListOrdered,
  Loader,
  MessageSquare,
  MousePointerClick,
  Palette,
  PanelBottom,
  PanelLeft,
  PanelTop,
  Search,
  Sparkles,
  Square,
  SquareMousePointer,
  Tag,
  TextCursorInput,
  ToggleRight,
  Upload,
  WrapText,
} from 'lucide-react';
import { SidebarNav, type SidebarNavSection } from '@/components';
import { CATEGORIES, COMPONENTS } from './catalog';

const ic = (I: React.ComponentType<{ size?: number; strokeWidth?: number }>) => <I size={18} strokeWidth={1.75} />;

const ICON: Record<string, React.ReactNode> = {
  overview: ic(LayoutGrid),
  tokens: ic(Palette),
  button: ic(MousePointerClick),
  'icon-button': ic(SquareMousePointer),
  badge: ic(Tag),
  card: ic(Square),
  avatar: ic(CircleUserRound),
  input: ic(TextCursorInput),
  textarea: ic(WrapText),
  select: ic(ChevronsUpDown),
  checkbox: ic(CheckSquare),
  radio: ic(CircleDot),
  switch: ic(ToggleRight),
  'date-time-picker': ic(CalendarClock),
  'file-upload': ic(Upload),
  'avatar-upload': ic(ImageUp),
  'search-input': ic(Search),
  'service-card': ic(Sparkles),
  'professional-card': ic(Contact),
  'appointment-card': ic(CalendarCheck),
  'weekly-schedule-editor': ic(CalendarRange),
  'top-bar': ic(PanelTop),
  tabs: ic(AppWindow),
  'bottom-nav': ic(PanelBottom),
  'sidebar-nav': ic(PanelLeft),
  stepper: ic(ListOrdered),
  alert: ic(AlertTriangle),
  toast: ic(MessageSquare),
  dialog: ic(MessageSquare),
  skeleton: ic(Loader),
  'empty-state': ic(Inbox),
};

const SECTIONS: SidebarNavSection[] = [
  {
    items: [
      { value: '/design-system', label: 'Overview', href: '/design-system', icon: ICON.overview },
      { value: '/design-system/tokens', label: 'Tokens', href: '/design-system/tokens', icon: ICON.tokens },
    ],
  },
  ...CATEGORIES.map((cat) => ({
    label: cat.label,
    items: COMPONENTS.filter((c) => c.category === cat.id).map((c) => {
      const href = `/design-system/${c.category}/${c.slug}`;
      return { value: href, label: c.name, href, icon: ICON[c.slug] };
    }),
  })),
];

function Mark({ size = 24 }: { size?: number }) {
  const gid = React.useId();
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" role="img" aria-label="Sereno" style={{ display: 'block', flex: '0 0 auto' }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7d8bdf" />
          <stop offset="1" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${gid})`} />
      <path d="M10.5 16.5l3.7 3.7L22 12" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** The showcase's own left nav — the SidebarNav component, rendering real links. */
export function Sidebar({ collapsed, onCollapsedChange }: { collapsed?: boolean; onCollapsedChange?: (c: boolean) => void }) {
  const pathname = usePathname();
  const active = pathname.replace(/\/$/, '') || '/design-system';
  const controlled = onCollapsedChange !== undefined;
  return (
    <SidebarNav
      sections={SECTIONS}
      value={active}
      linkComponent={Link}
      collapsible={controlled}
      collapsed={controlled ? collapsed : undefined}
      onCollapsedChange={onCollapsedChange}
      labels={{ expand: 'Expandir', collapse: 'Recolher' }}
      header={
        collapsed ? (
          <Mark size={26} />
        ) : (
          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Mark size={24} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-lg)', letterSpacing: '-0.03em', color: 'var(--text-brand)' }}>Sereno</span>
          </span>
        )
      }
      style={{ width: '100%', height: '100%' }}
    />
  );
}
