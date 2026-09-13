'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { sx } from '../_internal/style';

/**
 * Horizontal section switcher — a **compound component**. `underline` for
 * page-level sections, `pill` for filters inside a panel. When the tabs
 * overflow their width the strip scrolls horizontally, with a chevron on
 * whichever side has more; picking a tab scrolls it into view.
 *
 * ```tsx
 * <Tabs value={tab} onChange={setTab} variant="pill">
 *   <Tabs.List>
 *     <Tabs.Tab value="today" count={5}>Today</Tabs.Tab>
 *     <Tabs.Tab value="week" count={23}>Week</Tabs.Tab>
 *   </Tabs.List>
 *   <Tabs.Panel value="today">…</Tabs.Panel>
 *   <Tabs.Panel value="week">…</Tabs.Panel>
 * </Tabs>
 * ```
 *
 * `Tabs.Panel` is optional — nothing requires it. Render your own content
 * next to `Tabs.List`, keyed off the controlled `value`, if that reads
 * better for the screen.
 */
export interface TabsProps {
  value?: string;
  onChange?: (value: string) => void;
  variant?: 'underline' | 'pill';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export interface TabsListProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  children: React.ReactNode;
}

export interface TabsTabProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'onClick'> {
  value: string;
  icon?: React.ReactNode;
  count?: number;
  children: React.ReactNode;
}

export interface TabsPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
}

interface TabsContextValue {
  value?: string;
  onChange?: (value: string) => void;
  variant: 'underline' | 'pill';
  fullWidth: boolean;
}

/** Width of the overflow chevron's fade-out + hit area, and how much
 * scroll-padding the strip keeps on that side so scrollIntoView doesn't land
 * a tab half-hidden behind it. The chevron overlays this edge rather than
 * reserving space for itself — reserving space fit fewer tabs on screen at
 * once, for no benefit once the chevron reliably paints above the tab under
 * it (see Tab's z-index comment). */
const CHEVRON_W = 56;

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext(component: string): TabsContextValue {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error(`<Tabs.${component}> must be rendered inside <Tabs>.`);
  return ctx;
}

function TabsRoot({ value, onChange, variant = 'underline', fullWidth = false, children }: TabsProps) {
  const ctx = React.useMemo<TabsContextValue>(() => ({ value, onChange, variant, fullWidth }), [value, onChange, variant, fullWidth]);
  return <TabsContext.Provider value={ctx}>{children}</TabsContext.Provider>;
}

function List({ children, style, onKeyDown, ...rest }: TabsListProps) {
  const { value: activeValue, onChange, variant, fullWidth } = useTabsContext('List');
  const pill = variant === 'pill';
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [edge, setEdge] = React.useState({ left: false, right: false });
  const [indicator, setIndicator] = React.useState<{ left: number; width: number; top: number; height: number } | null>(null);

  const measureEdges = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setEdge({
      left: el.scrollLeft > 1,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
    });
  }, []);

  // Finds the active <Tabs.Tab> by its data-tab-value (no ref registry needed
  // — children render into this same scroll container) and measures it in the
  // container's own coordinate space, so `indicator.left` lines up with the
  // absolutely-positioned bar/pill below.
  const measureIndicator = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el || activeValue == null) {
      setIndicator(null);
      return;
    }
    let active: HTMLElement | null = null;
    el.querySelectorAll<HTMLElement>('[data-tab-value]').forEach((tab) => {
      if (tab.dataset.tabValue === activeValue) active = tab;
    });
    setIndicator(
      active
        ? { left: (active as HTMLElement).offsetLeft, width: (active as HTMLElement).offsetWidth, top: (active as HTMLElement).offsetTop, height: (active as HTMLElement).offsetHeight }
        : null,
    );
  }, [activeValue]);

  // Layout effect so the indicator lands in the right spot before paint —
  // no visible jump from a stale position on the very first render after a
  // value change.
  React.useLayoutEffect(() => {
    measureIndicator();
  }, [measureIndicator, children]);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    measureEdges();
    el.addEventListener('scroll', measureEdges, { passive: true });
    const ro = new ResizeObserver(() => {
      measureEdges();
      measureIndicator();
    });
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', measureEdges);
      ro.disconnect();
    };
  }, [measureEdges, measureIndicator, children]);

  const nudge = (dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: dir * scrollRef.current.clientWidth * 0.72, behavior: 'smooth' });
  };

  // Roving tabindex (SS-228): only the active Tab is ever tabIndex=0 (below),
  // so Tab enters/leaves the whole strip in one stop. Left/Right move — and,
  // matching this component's own "click selects immediately" contract
  // (automatic activation, not a separate confirm step), also *select* — the
  // adjacent tab, wrapping at the ends; Home/End jump to the first/last.
  // Reuses the same data-tab-value DOM query as measureIndicator above rather
  // than cloning children, for the same reason: List doesn't otherwise need
  // to know each Tab's position.
  const onListKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Home' && e.key !== 'End') return;
    const el = scrollRef.current;
    if (!el) return;
    const tabs = Array.from(el.querySelectorAll<HTMLElement>('[data-tab-value]'));
    if (tabs.length === 0) return;
    const current = tabs.findIndex((t) => t.dataset.tabValue === activeValue);
    let next = current;
    if (e.key === 'ArrowRight') next = current < 0 ? 0 : (current + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') next = current < 0 ? tabs.length - 1 : (current - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    e.preventDefault();
    const nextTab = tabs[next];
    const nextValue = nextTab.dataset.tabValue;
    if (nextValue !== undefined) onChange?.(nextValue);
    nextTab.focus();
    nextTab.scrollIntoView({ inline: 'nearest', block: 'nearest' });
  };

  const fade = pill ? 'var(--bg-subtle)' : 'var(--bg-surface)';

  return (
    <div
      style={sx({
        position: 'relative',
        display: pill && !fullWidth ? 'inline-flex' : 'flex',
        alignSelf: pill && !fullWidth ? 'flex-start' : undefined,
        width: !pill && fullWidth ? '100%' : undefined,
        maxWidth: '100%',
        borderRadius: pill ? 'var(--radius-pill)' : 0,
        background: pill ? 'var(--bg-subtle)' : 'transparent',
        borderBottom: pill ? 'none' : 'var(--border-width-hairline) solid var(--border-default)',
        ...style,
      })}
    >
      <div
        ref={scrollRef}
        role="tablist"
        {...rest}
        onKeyDown={(e) => {
          onListKeyDown(e);
          onKeyDown?.(e);
        }}
        className={'sereno-tab-scroll' + (rest.className ? ' ' + rest.className : '')}
        style={sx({
          position: 'relative',
          display: 'flex',
          flex: 1,
          minWidth: 0,
          overflowX: 'auto',
          gap: pill ? 'var(--space-1)' : 'var(--space-5)',
          padding: pill ? 'var(--space-1)' : 0,
          // The chevron overlays this edge (see ScrollChevron) rather than
          // reserving permanent space for itself — reserving space fit fewer
          // tabs on screen at once for no real benefit once the chevron
          // paints correctly above whatever tab is underneath it (the actual
          // bug, fixed below on Tab). scroll-padding keeps scrollIntoView
          // from landing a tab half-behind the chevron's fade.
          scrollPaddingLeft: CHEVRON_W,
          scrollPaddingRight: CHEVRON_W,
        })}
      >
        {indicator && (
          <span
            aria-hidden
            style={sx({
              position: 'absolute',
              left: indicator.left,
              width: indicator.width,
              zIndex: 0,
              pointerEvents: 'none',
              transition: 'left 200ms ease, width 200ms ease, top 200ms ease, height 200ms ease',
              // Match the active Tab's own box exactly (offsetTop/offsetHeight,
              // not top:0/bottom:0) — the latter is relative to the scroll
              // container's *padding edge*, which for `pill` ignores the
              // container's own padding and over-fills it top-to-bottom.
              ...(pill
                ? { top: indicator.top, height: indicator.height, borderRadius: 'var(--radius-pill)', background: 'var(--bg-surface)', boxShadow: 'var(--shadow-xs)' }
                : { top: 'auto', bottom: 0, height: 2, background: 'var(--interactive-primary)' }),
            })}
          />
        )}
        {children}
      </div>

      {edge.left && <ScrollChevron side="left" fade={fade} pill={pill} onClick={() => nudge(-1)} />}
      {edge.right && <ScrollChevron side="right" fade={fade} pill={pill} onClick={() => nudge(1)} />}
    </div>
  );
}

function Tab({ value, icon, count, children, style, ...rest }: TabsTabProps) {
  const { value: activeValue, onChange, variant, fullWidth } = useTabsContext('Tab');
  const pill = variant === 'pill';
  const active = activeValue === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      data-tab-value={value}
      // Roving tabindex (SS-228): only the active tab is a Tab stop — List's
      // onKeyDown moves *and* focuses between tabs with the arrow keys, so
      // Tab itself only needs to enter/leave the strip once.
      tabIndex={active ? 0 : -1}
      {...rest}
      className={'sereno-tab' + (rest.className ? ' ' + rest.className : '')}
      onClick={(e) => {
        onChange?.(value);
        e.currentTarget.scrollIntoView({ inline: 'nearest', block: 'nearest' });
      }}
      style={sx({
        // position:relative (no explicit z-index) is enough to paint above
        // the indicator — both sit in the DOM-order-decided stacking layer,
        // and this comes later. An explicit z-index would promote this into
        // its own stacking context ranked ahead of *everything* z-index:auto,
        // including the unrelated ScrollChevron sibling outside this row —
        // which is exactly the bug that shipped: the chevron ended up
        // painted underneath every tab, visible only through the gaps
        // between glyphs of whichever tab it overlapped.
        position: 'relative',
        flex: fullWidth ? 1 : '0 0 auto',
        whiteSpace: 'nowrap',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-2)',
        border: 'none',
        cursor: 'pointer',
        // Not inline outline:none — see the .sereno-tab rule in styles.css
        // for why that would permanently beat :focus-visible.
        background: 'transparent',
        borderRadius: pill ? 'var(--radius-pill)' : 0,
        // Symmetric top/bottom (SS-228 follow-up): this used to be `0 0
        // var(--space-3)` — no top padding, all the reserved space for the
        // underline bar's gap on the bottom — which left the label sitting
        // visibly above the button's own box center (and by extension above
        // center of the focus-ring outline, which traces that box). Equal
        // padding centers the label; ScrollChevron no longer needs its old
        // -6px compensation for this (see its own comment).
        padding: pill ? '8px var(--space-4)' : 'var(--space-3) 0',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-base)',
        fontWeight: active ? 'var(--weight-semibold)' : 'var(--weight-medium)',
        color: active ? (pill ? 'var(--text-primary)' : 'var(--text-brand)') : 'var(--text-secondary)',
        transition: 'var(--transition-control)',
        ...style,
      })}
    >
      {icon}
      {children}
      {count !== undefined && (
        <span
          style={sx({
            fontSize: 'var(--text-2xs)',
            fontWeight: 'var(--weight-bold)',
            padding: '1px 6px',
            borderRadius: '999px',
            background: active ? 'var(--bg-brand-soft)' : pill ? 'var(--bg-surface)' : 'var(--bg-subtle)',
            // text-muted here was < 4.5:1 on bg-subtle (SS-230) — text-secondary
            // both fixes that and matches the inactive tab label's own color
            // (line ~253), which was already text-secondary, not text-muted.
            color: active ? 'var(--text-brand)' : 'var(--text-secondary)',
          })}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function Panel({ value, children, ...rest }: TabsPanelProps) {
  const { value: activeValue } = useTabsContext('Panel');
  if (activeValue !== value) return null;
  return (
    // tabIndex=0 (WAI-ARIA APG Tabs pattern): the panel itself is the next
    // Tab stop after the tablist, so keyboard users land in the tab's own
    // content next — not in whatever unrelated element happens to follow it
    // in the DOM (e.g. this docs site's own "Show Code" toggle). A consumer
    // rendering focusable content of its own can override via `rest`.
    <div role="tabpanel" tabIndex={0} {...rest}>
      {children}
    </div>
  );
}

function ScrollChevron({ side, fade, pill, onClick }: { side: 'left' | 'right'; fade: string; pill: boolean; onClick: () => void }) {
  return (
    <span
      aria-hidden
      style={sx({
        position: 'absolute',
        top: 0,
        bottom: 0,
        [side]: 0,
        width: CHEVRON_W,
        display: 'flex',
        alignItems: 'center',
        justifyContent: side === 'left' ? 'flex-start' : 'flex-end',
        pointerEvents: 'none',
        // Fades the tab it overlays out towards this edge — the button
        // itself paints above every tab (Tab has no explicit z-index, so
        // it can't outrank this), so it's never actually hidden by one;
        // this is purely about not hard-cutting the text right at the
        // button's boundary.
        background: `linear-gradient(to ${side === 'left' ? 'right' : 'left'}, ${fade} 55%, transparent)`,
        borderRadius: pill ? 'var(--radius-pill)' : 0,
      })}
    >
      <button
        type="button"
        tabIndex={-1}
        onClick={onClick}
        style={sx({
          pointerEvents: 'auto',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 26,
          height: 26,
          borderRadius: '999px',
          border: '1px solid var(--border-strong)',
          // White, matching the DS's other floating circular controls.
          background: 'var(--bg-surface)',
          boxShadow: 'var(--shadow-md)',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          // No vertical correction needed here anymore — Tab's own padding
          // is symmetric top/bottom for both variants now, so the row's
          // geometric center already matches the label's center.
        })}
      >
        {side === 'left' ? <ChevronLeft size={16} strokeWidth={2} /> : <ChevronRight size={16} strokeWidth={2} />}
      </button>
    </span>
  );
}

export const Tabs = Object.assign(TabsRoot, { List, Tab, Panel });
