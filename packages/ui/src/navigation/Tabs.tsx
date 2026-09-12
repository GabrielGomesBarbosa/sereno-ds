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

/** Width of the overflow chevron's own reserved space — Tabs.List opens up
 * a margin this wide on whichever edge is scrollable, so the chevron sits in
 * real dead space next to the strip instead of overlaid on top of it. */
const CHEVRON_W = 44;

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

function List({ children, style, ...rest }: TabsListProps) {
  const { value: activeValue, variant, fullWidth } = useTabsContext('List');
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
        className={'sereno-tab-scroll' + (rest.className ? ' ' + rest.className : '')}
        style={sx({
          position: 'relative',
          display: 'flex',
          flex: 1,
          minWidth: 0,
          overflowX: 'auto',
          gap: pill ? 'var(--space-1)' : 'var(--space-5)',
          padding: pill ? 'var(--space-1)' : 0,
          // Reserve the chevron's own footprint as real layout space,
          // outside the scrollable box itself, on whichever edge is
          // currently scrollable — margin (unlike padding) isn't part of
          // what scrollWidth/clientWidth measure, so this can't feed back
          // into the edge-detection above, and it's *why* this works at
          // all: the chevron's span is absolutely positioned flush with
          // the outer wrapper's edge, so this margin opens real dead space
          // there for it to sit in, geometrically outside the scrollable
          // content rather than floating over whatever tab happens to be
          // at that edge — which is what let a tab's own (necessarily
          // interactive, unstyled-behind) box paint over the chevron.
          marginLeft: edge.left ? CHEVRON_W : 0,
          marginRight: edge.right ? CHEVRON_W : 0,
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

      {edge.left && <ScrollChevron side="left" pill={pill} onClick={() => nudge(-1)} />}
      {edge.right && <ScrollChevron side="right" pill={pill} onClick={() => nudge(1)} />}
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
      {...rest}
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
        outline: 'none',
        background: 'transparent',
        borderRadius: pill ? 'var(--radius-pill)' : 0,
        padding: pill ? '8px var(--space-4)' : '0 0 var(--space-3)',
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
            color: active ? 'var(--text-brand)' : 'var(--text-muted)',
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
    <div role="tabpanel" {...rest}>
      {children}
    </div>
  );
}

function ScrollChevron({ side, pill, onClick }: { side: 'left' | 'right'; pill: boolean; onClick: () => void }) {
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
        // Centered, not hugging the edge — this span now sits in the
        // margin gap Tabs.List opens up for it (real dead space, not an
        // overlay on the scrollable content), so there's no cut-off tab
        // text underneath it to stay close to anymore.
        justifyContent: 'center',
        pointerEvents: 'none',
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
          // Measured against the actual glyph box (Range.getBoundingClientRect
          // on the label's text node, not the row's own padded box) — the
          // label sits ~6px above the row's geometric center, since the row
          // reserves padding-bottom for the underline that the text itself
          // doesn't use. -1px undershot this; matching the glyph center
          // exactly takes the full -6px.
          transform: 'translateY(-6px)',
        })}
      >
        {side === 'left' ? <ChevronLeft size={16} strokeWidth={2} /> : <ChevronRight size={16} strokeWidth={2} />}
      </button>
    </span>
  );
}

export const Tabs = Object.assign(TabsRoot, { List, Tab, Panel });
