'use client';

import * as React from 'react';
import { ChevronRight } from 'lucide-react';
import { sx } from '../_internal/style';
import { useInteract } from './Button';
import { Typography } from './Typography';

export type ActionCardVariant = 'default' | 'primary' | 'error';

/**
 * A whole card you press: an icon, a title, a line of explanation and an arrow, in a real
 * `<button>`. For the options of a decision ("Reschedule", "Cancel the booking") and for the
 * entries of a settings flow. A `Card` with `interactive` is the bare surface; this is the
 * finished control, with the keyboard, the focus ring and the disabled state taken care of.
 *
 * It is an action, not a radio: arrow keys do not move between cards. `selected` marks a card as
 * a toggle (`aria-pressed`); for "choose exactly one of these" the semantics are a radio group's,
 * which this is not.
 */
export interface ActionCardProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'title' | 'children'> {
  /** What the card does. Short: it is the name a screen reader says. */
  title: React.ReactNode;
  /** One line that says what happens. */
  description?: React.ReactNode;
  /** An icon (a `lucide-react` element), drawn in a tile on the left. Hidden from a screen reader: the title says it. */
  icon?: React.ReactNode;
  /** What sits on the right. An arrow by default; any node, or `null` for nothing. */
  trailing?: React.ReactNode;
  /**
   * Passing it (true or false) makes the card a toggle: it reports `aria-pressed` and, when true,
   * wears the brand ring. Leave it out for a plain action.
   */
  selected?: boolean;
  /** `primary` is the option to steer toward, `error` a destructive one. */
  variant?: ActionCardVariant;
}

// `title` is the text color of the variant, when it has one. The error one is `--status-error-fg`, not
// `--interactive-error`: on the hover fill the latter is 3.53:1 in the light theme (4.2:1 in the dark one),
// under AA for text this size, where the status text color stays at 4.86:1 and 6.69:1.
const VARIANTS: Record<ActionCardVariant, { tileBg: string; tileFg: string; edge: string; title?: string }> = {
  default: { tileBg: 'var(--bg-subtle)', tileFg: 'var(--text-secondary)', edge: 'var(--border-brand)' },
  primary: { tileBg: 'var(--interactive-primary)', tileFg: 'var(--interactive-primary-fg)', edge: 'var(--border-brand)' },
  error: { tileBg: 'var(--status-error-bg)', tileFg: 'var(--status-error-fg)', edge: 'var(--status-error-dot)', title: 'var(--status-error-fg)' },
};

// The fill of a hovered card: a few percent of the variant's own ring color over the surface. Not
// `--interactive-ghost-hover`: that grey is the very color of the icon tile (`--bg-subtle`), so on hover the
// tile vanished into the card. This tint keeps the tile showing (1.20:1 against it in the light theme, 1.17:1
// in the dark one, close to the 1.28:1 and 1.23:1 it has against the idle card) and keeps every text above AA.
const hoverFill = (edge: string) => 'color-mix(in srgb, ' + edge + ' 6%, var(--bg-surface))';

export function ActionCard({
  title,
  description,
  icon,
  trailing,
  selected,
  variant = 'default',
  disabled = false,
  style,
  ...rest
}: ActionCardProps) {
  const st = useInteract(disabled);
  const v = VARIANTS[variant] || VARIANTS.default;
  const on = selected === true;
  const arrow = trailing === undefined ? <ChevronRight size={18} strokeWidth={1.75} aria-hidden /> : trailing;

  const ring = on ? '0 0 0 1.5px ' + v.edge : '0 0 0 1px ' + (!disabled && st.hover ? v.edge : disabled ? 'var(--border-subtle)' : 'var(--border-default)');
  // Only set when disabled: a `color: undefined` in a style would wipe the Typography's own.
  const muted = disabled ? { color: 'var(--text-disabled)' } : undefined;
  const titleStyle = disabled ? muted : v.title ? { color: v.title } : undefined;

  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      {...st.handlers}
      {...rest}
      style={sx({
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        width: '100%',
        minWidth: 0,
        padding: 'var(--space-3) var(--space-4)',
        textAlign: 'left',
        fontFamily: 'var(--font-body)',
        color: 'inherit',
        border: 'none',
        borderRadius: 'var(--radius-card)',
        background: !disabled && st.hover ? hoverFill(v.edge) : 'var(--bg-surface)',
        boxShadow: [ring, st.focus ? 'var(--focus-ring)' : null].filter(Boolean).join(', '),
        transform: st.press && !disabled ? 'scale(var(--press-scale))' : 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'var(--transition-control)',
        // The focus ring above is the box-shadow, the same substitute `Button` and `Card` use.
        outline: 'none',
        ...style,
      })}
    >
      {icon ? (
        <span
          aria-hidden
          style={sx({
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: '0 0 auto',
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-md)',
            background: disabled ? 'var(--interactive-disabled-bg)' : v.tileBg,
            color: disabled ? 'var(--interactive-disabled-fg)' : v.tileFg,
          })}
        >
          {icon}
        </span>
      ) : null}

      <span style={sx({ display: 'flex', flexDirection: 'column', gap: 2, flex: '1 1 auto', minWidth: 0 })}>
        <Typography as="span" variant="label" style={titleStyle}>
          {title}
        </Typography>
        {description ? (
          <Typography as="span" variant="bodySm" style={muted}>
            {description}
          </Typography>
        ) : null}
      </span>

      {arrow ? (
        <span style={sx({ display: 'inline-flex', flex: '0 0 auto', color: disabled ? 'var(--text-disabled)' : 'var(--text-muted)' })}>
          {arrow}
        </span>
      ) : null}
    </button>
  );
}
