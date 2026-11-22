'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Brand, SearchInput, SidebarNav } from '@sereno-ds/ui';
import { CATEGORIES, COMPONENTS } from './catalog';
import { matchRank } from './sidebarSearch';

const TOP_LEVEL = [
  { label: 'Overview', href: '/design-system' },
  { label: 'Tokens', href: '/design-system/tokens' },
];

/** Visually hidden but still announced - the result count for screen readers. */
const SR_ONLY: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

/**
 * The showcase's own left nav - the SidebarNav component rendering real links,
 * with a search field pinned above the list.
 *
 * The search is composed here, not built into SidebarNav: the nav renders any
 * children inside its scroll area, and the filter belongs to whoever owns the
 * list (this app owns the catalogue). The field is `position: sticky` so it
 * stays in view while the list scrolls.
 *
 * No collapse toggle here: this catalogue has no per-item icons, so a collapsed
 * icon rail would have nothing to show (a search field would not fit the rail
 * either).
 */
export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const active = pathname.replace(/\/$/, '') || '/design-system';

  // The text is remembered together with the page it was typed on, so going to
  // another page resets the filter without an effect: a search is a "jump to",
  // and the full list is what you want back once you have jumped.
  const [typed, setTyped] = React.useState({ text: '', path: pathname });
  const query = typed.path === pathname ? typed.text.trim() : '';

  const inputRef = React.useRef<HTMLInputElement>(null);

  // "/" and Ctrl/Cmd+K focus the search. There are two Sidebars (the desktop panel
  // and the mobile drawer); only the one on screen answers.
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const field = inputRef.current;
      if (!field || field.getClientRects().length === 0) return;
      // A modal (a demo Dialog) that does not contain the field owns the keyboard.
      const modal = document.querySelector('[aria-modal="true"]');
      if (modal && !modal.contains(field)) return;
      const target = e.target instanceof HTMLElement ? e.target : null;
      const typing = !!target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
      const chord = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      const slash = e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey && !typing;
      if (!chord && !slash) return;
      e.preventDefault();
      field.focus();
      field.select();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const topLevel = TOP_LEVEL.filter((item) => matchRank(query, item.label) !== null);
  const groups = CATEGORIES.map((cat) => ({
    cat,
    items: COMPONENTS.filter((c) => c.category === cat.id && matchRank(query, c.name, c.slug) !== null),
  })).filter((group) => group.items.length > 0);

  const total = topLevel.length + groups.reduce((sum, group) => sum + group.items.length, 0);

  // Enter opens the best match: an exact or prefix hit beats a plain "contains", and
  // between equals the shorter name wins ("date" opens DatePicker, not DateTimePicker).
  const openBestMatch = () => {
    const candidates = [
      ...TOP_LEVEL.map((item) => ({ href: item.href, rank: matchRank(query, item.label), length: item.label.length })),
      ...COMPONENTS.map((c) => ({ href: `/design-system/${c.category}/${c.slug}`, rank: matchRank(query, c.name, c.slug), length: c.name.length })),
    ];
    let best: { href: string; rank: number; length: number } | undefined;
    for (const { href, rank, length } of candidates) {
      if (rank === null) continue;
      if (!best || rank < best.rank || (rank === best.rank && length < best.length)) best = { href, rank, length };
    }
    if (best) router.push(best.href);
  };

  return (
    <SidebarNav
      value={active}
      linkComponent={Link}
      collapsible={false}
      header={
        <Link href="/" aria-label="Sereno: home" style={{ display: 'inline-flex', textDecoration: 'none' }}>
          <Brand variant="lockup" size={28} />
        </Link>
      }
      style={{ width: '100%', height: '100%' }}
    >
      {/* SearchInput owns its onKeyDown (Enter / Esc), so Enter is caught on the wrapper as it bubbles up. */}
      <div
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.nativeEvent.isComposing && query) {
            e.preventDefault();
            openBestMatch();
          }
        }}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 2,
          // Cancel the scroll area's own padding so the field sits where the first item
          // used to and the opaque background covers items scrolling underneath it.
          margin: 'calc(-1 * var(--space-2)) calc(-1 * var(--space-3)) var(--space-2)',
          padding: 'var(--space-2) var(--space-3)',
          background: 'var(--bg-surface)',
        }}
      >
        <SearchInput
          ref={inputRef}
          aria-label="Search components"
          aria-keyshortcuts="/ Control+K Meta+K"
          title="Press / to search"
          placeholder="Search components"
          clearLabel="Clear search"
          value={typed.path === pathname ? typed.text : ''}
          onValueChange={(text) => setTyped({ text, path: pathname })}
        />
      </div>

      {query && (
        <p
          role="status"
          style={
            total === 0
              ? { margin: 0, padding: 'var(--space-2) var(--space-3)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }
              : SR_ONLY
          }
        >
          {total === 0 ? `No component matches “${query}”.` : `${total} ${total === 1 ? 'result' : 'results'}`}
        </p>
      )}

      {topLevel.length > 0 && (
        <SidebarNav.Section>
          {topLevel.map((item) => (
            <SidebarNav.Item key={item.href} value={item.href} label={item.label} href={item.href} />
          ))}
        </SidebarNav.Section>
      )}
      {groups.map(({ cat, items }) => (
        <SidebarNav.Section key={cat.id} label={cat.label}>
          {items.map((c) => {
            const href = `/design-system/${c.category}/${c.slug}`;
            return <SidebarNav.Item key={href} value={href} label={c.name} href={href} />;
          })}
        </SidebarNav.Section>
      ))}
    </SidebarNav>
  );
}
