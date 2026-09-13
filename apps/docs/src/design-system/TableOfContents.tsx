'use client';

import * as React from 'react';

/**
 * The sticky "On this page" rail — shared by the Overview/Tokens pages
 * (`DocPage`) and every component page (`ComponentView`). Tracks which
 * section is currently in view (`IntersectionObserver`, not scroll-position
 * math) and highlights it — a plain list of links with no sense of "where
 * you are" wasn't pulling its weight on a page long enough to need one.
 */

const sectionLabel: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-2xs)',
  fontWeight: 700,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  margin: 0,
};

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export interface TocItem {
  id: string;
  label: string;
}

/** Consistent scroll offset for section anchors targeted by the index. */
export const docSectionAnchor: React.CSSProperties = { scrollMarginTop: 'var(--space-6)' };

export function TableOfContents({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = React.useState<string | undefined>(items[0]?.id);

  React.useEffect(() => {
    const targets = items.map((t) => document.getElementById(t.id)).filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    // A section counts as "current" once it's crossed into the top band of the
    // viewport (below the sticky header) and hasn't scrolled past the middle —
    // not merely "on screen at all", or the last section lights up the moment
    // it peeks into view at the bottom.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const topmost = visible.reduce((a, b) => (a.boundingClientRect.top <= b.boundingClientRect.top ? a : b));
        setActiveId(topmost.target.id);
      },
      { rootMargin: '-96px 0px -66% 0px', threshold: 0 },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  return (
    <aside className="cv-toc">
      <span style={{ ...sectionLabel, marginBottom: 'var(--space-2)', display: 'block' }}>On this page</span>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map((t) => {
          const active = t.id === activeId;
          return (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => scrollToId(t.id)}
                aria-current={active ? 'true' : undefined}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  border: 'none',
                  borderLeft: `2px solid ${active ? 'var(--interactive-primary)' : 'transparent'}`,
                  background: 'transparent',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  // Round only the trailing corners — rounding the leading ones too would
                  // curve the active border-left into a bracket shape instead of a straight bar.
                  borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: active ? 'var(--weight-semibold)' : 'var(--weight-medium)',
                  color: active ? 'var(--text-brand)' : 'var(--text-secondary)',
                  transition: 'var(--transition-control)',
                }}
              >
                {t.label}
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
