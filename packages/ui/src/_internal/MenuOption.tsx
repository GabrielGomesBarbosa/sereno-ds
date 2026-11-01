import * as React from 'react';
import { Check } from 'lucide-react';
import { sx } from './style';

type Size = 'sm' | 'md' | 'lg';

const OPTION_PAD_Y = { sm: 6, md: 8, lg: 10 } as const;

/** The vertical padding of an option row: finger-sized on touch, by field size on a mouse. */
export function menuRowPadY(coarse: boolean, size: Size): number {
  return coarse ? 12 : OPTION_PAD_Y[size];
}

/**
 * The look of the floating list shared by `Select` and `Autocomplete`: the surface (border, fill,
 * shadow, radius, type) and the scrolling `<ul>` inside it. One place, so the two cannot drift apart.
 */
export function menuSurfaceStyle(size: Size): React.CSSProperties {
  return {
    minWidth: 160,
    background: 'var(--bg-surface)',
    border: 'var(--border-width-hairline) solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-lg)',
    fontFamily: 'var(--font-body)',
    fontSize: size === 'sm' ? 'var(--text-sm)' : 'var(--text-base)',
  };
}

export const menuListStyle: React.CSSProperties = {
  overflowY: 'auto',
  margin: 0,
  padding: 'var(--space-1)',
  listStyle: 'none',
};

export interface MenuOptionProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, 'children'> {
  label: string;
  selected: boolean;
  active: boolean;
  disabled?: boolean;
  coarse: boolean;
  padY: number;
}

/** One row of the list: the label, a check on the selected one, the hover/active fill. */
export function MenuOption({ label, selected, active, disabled, coarse, padY, style, ...rest }: MenuOptionProps) {
  return (
    <li
      role="option"
      aria-selected={selected}
      aria-disabled={disabled || undefined}
      {...rest}
      style={sx({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-2)',
        minHeight: coarse ? 44 : undefined,
        padding: `${padY}px var(--space-3)`,
        borderRadius: 'var(--radius-sm)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        color: disabled ? 'var(--text-disabled)' : 'var(--text-primary)',
        background: active && !disabled ? 'var(--bg-subtle)' : 'transparent',
        fontWeight: selected ? 'var(--weight-semibold)' : 'var(--weight-regular)',
        fontSize: coarse ? 'var(--text-base)' : undefined,
        ...style,
      })}
    >
      <span style={sx({ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })}>{label}</span>
      {selected && (
        <span style={sx({ display: 'flex', flex: '0 0 auto', color: 'var(--text-brand)' })}>
          <Check size={coarse ? 18 : 16} strokeWidth={2} />
        </span>
      )}
    </li>
  );
}
