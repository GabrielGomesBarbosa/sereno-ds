'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { sx } from '../_internal/style';

export interface TabItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

/**
 * Horizontal section switcher. `underline` for page-level sections, `pill` for
 * filters inside a panel. When the tabs overflow their width the strip scrolls
 * horizontally, with a chevron on whichever side has more.
 */
export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items: TabItem[];
  value?: string;
  onChange?: (value: string) => void;
  variant?: 'underline' | 'pill';
  fullWidth?: boolean;
}

export function Tabs({ items = [], value, onChange, variant = 'underline', fullWidth = false, style, ...rest }: TabsProps) {
  const pill = variant === 'pill';
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [edge, setEdge] = React.useState({ left: false, right: false });

  const measure = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setEdge({
      left: el.scrollLeft > 1,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
    });
  }, []);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    measure();
    el.addEventListener('scroll', measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', measure);
      ro.disconnect();
    };
  }, [measure, items]);

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
          display: 'flex',
          flex: 1,
          minWidth: 0,
          overflowX: 'auto',
          gap: pill ? 'var(--space-1)' : 'var(--space-5)',
          padding: pill ? 'var(--space-1)' : 0,
        })}
      >
        {items.map((it) => {
          const active = value === it.value;
          return (
            <button
              key={it.value}
              role="tab"
              aria-selected={active}
              onClick={(e) => {
                onChange?.(it.value);
                e.currentTarget.scrollIntoView({ inline: 'nearest', block: 'nearest' });
              }}
              style={sx({
                flex: fullWidth ? 1 : '0 0 auto',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-2)',
                border: 'none',
                cursor: 'pointer',
                outline: 'none',
                background: pill ? (active ? 'var(--bg-surface)' : 'transparent') : 'transparent',
                boxShadow: pill && active ? 'var(--shadow-xs)' : 'none',
                borderRadius: pill ? 'var(--radius-pill)' : 0,
                padding: pill ? '8px var(--space-4)' : '0 0 var(--space-3)',
                borderBottom: pill ? 'none' : '2px solid ' + (active ? 'var(--interactive-primary)' : 'transparent'),
                marginBottom: pill ? 0 : -1,
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-base)',
                fontWeight: active ? 'var(--weight-semibold)' : 'var(--weight-medium)',
                color: active ? (pill ? 'var(--text-primary)' : 'var(--text-brand)') : 'var(--text-secondary)',
                transition: 'var(--transition-control)',
              })}
            >
              {it.icon}
              {it.label}
              {it.count !== undefined && (
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
                  {it.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {edge.left && <ScrollChevron side="left" fade={fade} pill={pill} onClick={() => nudge(-1)} />}
      {edge.right && <ScrollChevron side="right" fade={fade} pill={pill} onClick={() => nudge(1)} />}
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
        bottom: pill ? 0 : 1,
        [side]: 0,
        width: 44,
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
          border: '1px solid var(--border-default)',
          background: 'var(--bg-surface)',
          boxShadow: 'var(--shadow-sm)',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
        })}
      >
        {side === 'left' ? <ChevronLeft size={16} strokeWidth={2} /> : <ChevronRight size={16} strokeWidth={2} />}
      </button>
    </span>
  );
}
