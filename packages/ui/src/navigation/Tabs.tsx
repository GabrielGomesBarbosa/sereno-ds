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

/** Width of the overflow chevron button — also how much `scroll-padding` the
 * strip keeps on that side, so `scrollIntoView` never lands a tab half-hidden
 * behind the chevron's fade-out gradient. */
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
        className={'sereno-tab-scroll' + (rest.className ? ' ' + rest.className : '')}
        style={sx({
          position: 'relative',
          display: 'flex',
          flex: 1,
          minWidth: 0,
          overflowX: 'auto',
          gap: pill ? 'var(--space-1)' : 'var(--space-5)',
          padding: pill ? 'var(--space-1)' : 0,
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
      {...rest}
      onClick={(e) => {
        onChange?.(value);
        e.currentTarget.scrollIntoView({ inline: 'nearest', block: 'nearest' });
      }}
      style={sx({
        position: 'relative',
        zIndex: 1, // above the sliding indicator, which shares this row
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
          // White like the DS's other floating circular controls (IconButton,
          // Menu's trigger chrome) — consistent with that language, and
          // --shadow-md (real elevation, not the whisper-thin --shadow-sm)
          // is what actually keeps it visible on a white card, not a fill
          // color fighting the fade gradient underneath.
          background: 'var(--bg-surface)',
          boxShadow: 'var(--shadow-md)',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          // Optical, not geometric: text sits in the upper part of the row
          // (no top padding, space reserved below for the underline), so a
          // circle dead-centered on the row's full box reads as low against
          // it. Nudge up a couple px to match where the eye reads the label.
          transform: 'translateY(-2px)',
        })}
      >
        {side === 'left' ? <ChevronLeft size={16} strokeWidth={2} /> : <ChevronRight size={16} strokeWidth={2} />}
      </button>
    </span>
  );
}

export const Tabs = Object.assign(TabsRoot, { List, Tab, Panel });
