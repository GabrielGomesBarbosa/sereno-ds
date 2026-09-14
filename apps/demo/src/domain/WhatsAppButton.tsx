'use client';

import * as React from 'react';

export interface WhatsAppButtonProps {
  /** Any format — non-digits are stripped. Must include the country code (e.g. "+55 11 99999-8888"). */
  phone: string;
  /** Pre-filled message text. */
  message?: string;
  /** Visible label. Icon-only (a round button) when omitted. */
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: React.CSSProperties;
}

// WhatsApp's own dark teal (their header/app-bar color), not the brighter
// mint green (#25D366) — white text on that one measures ~2:1, nowhere
// near WCAG AA's 4.5:1 for the labeled button's text. This teal is ~7.9:1,
// still unmistakably "WhatsApp", and also clears the 3:1 non-text/graphical
// bar for the icon-only variant against a light page background. The one
// deliberate exception to this app's token-driven palette — the button's
// color IS the channel it represents (same reasoning a "Sign in with
// Google" button keeps Google's palette in an otherwise branded app).
// Never reuse this hex elsewhere; promote it to a real token if a second
// spot ever needs it.
const WA_TEAL = '#075E54';
const WA_TEAL_HOVER = '#0C6B60';
const WA_TEAL_ACTIVE = '#054A42';
const WA_TINT_HOVER = 'rgba(7, 94, 84, 0.12)';

function waUrl(phone: string, message?: string): string {
  const digits = phone.replace(/\D/g, '');
  return `https://wa.me/${digits}` + (message ? `?text=${encodeURIComponent(message)}` : '');
}

/** The official WhatsApp glyph — lucide-react (this app's only icon source,
 * see AGENTS.md) ships no brand logos, so this is the one hand-embedded
 * brand SVG in the app. */
function WhatsAppGlyph({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413" />
    </svg>
  );
}

const H = { sm: 'var(--control-height-sm)', md: 'var(--control-height-md)', lg: 'var(--control-height-lg)' } as const;
const PX = { sm: 'var(--space-3)', md: 'var(--space-4)', lg: 'var(--space-5)' } as const;
const FS = { sm: 'var(--text-sm)', md: 'var(--text-base)', lg: 'var(--text-md)' } as const;
const ICON_D = { sm: 32, md: 40, lg: 48 } as const;
const ICON_GLYPH = { sm: 16, md: 18, lg: 20 } as const;

/**
 * Quick action that opens a WhatsApp chat with a client or professional in
 * a new tab — the product's own communication channel (reminders,
 * confirmations and cancellations already go out over WhatsApp; see
 * BookingFlow, AgendaView). A plain `<button onClick>` opening the URL via
 * `window.open`, not a real `<a href>`: it needs the same `disabled`
 * affordance as every other control when there's no phone on file, which a
 * plain anchor can't fake convincingly for keyboard/AT users.
 *
 * Hand-rolled rather than wrapping `Button`/`IconButton`: those compute
 * their hover/press colors from the DS's own token palette with no escape
 * hatch for a one-off brand color (see the WA_TEAL comment above), so this
 * carries its own small hover/press/focus-visible state instead. Shape,
 * spacing and type still read off the same tokens as everywhere else —
 * only the fill color is the deliberate exception.
 */
export function WhatsAppButton({ phone, message, label, size = 'md', disabled = false, style }: WhatsAppButtonProps) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const [focus, setFocus] = React.useState(false);
  const off = disabled || !phone;

  const open = () => {
    if (off) return;
    window.open(waUrl(phone, message), '_blank', 'noopener,noreferrer');
  };

  const handlers = off
    ? {}
    : {
        onMouseEnter: () => setHover(true),
        onMouseLeave: () => {
          setHover(false);
          setPress(false);
        },
        onMouseDown: () => setPress(true),
        onMouseUp: () => setPress(false),
        onFocus: (e: React.FocusEvent<HTMLButtonElement>) => {
          if (e.target.matches(':focus-visible')) setFocus(true);
        },
        onBlur: () => setFocus(false),
      };

  const focusRing = focus ? `0 0 0 2px var(--bg-surface), 0 0 0 4px ${WA_TEAL}` : 'none';

  if (label) {
    const bg = off ? 'var(--interactive-disabled-bg)' : press ? WA_TEAL_ACTIVE : hover ? WA_TEAL_HOVER : WA_TEAL;
    return (
      <button
        type="button"
        disabled={off}
        {...handlers}
        onClick={open}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          height: H[size],
          padding: `0 ${PX[size]}`,
          fontFamily: 'var(--font-body)',
          fontSize: FS[size],
          fontWeight: 'var(--weight-semibold)',
          letterSpacing: 'var(--tracking-snug)',
          borderRadius: 'var(--radius-control)',
          border: 'none',
          background: bg,
          color: off ? 'var(--interactive-disabled-fg)' : '#FFFFFF',
          boxShadow: focusRing,
          transform: press && !off ? 'scale(var(--press-scale))' : 'none',
          cursor: off ? 'not-allowed' : 'pointer',
          transition: 'var(--transition-control)',
          outline: 'none',
          ...style,
        }}
      >
        <WhatsAppGlyph size={ICON_GLYPH[size]} />
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={off}
      aria-label="Conversar no WhatsApp"
      title="Conversar no WhatsApp"
      {...handlers}
      onClick={open}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: ICON_D[size],
        height: ICON_D[size],
        borderRadius: 'var(--radius-control)',
        border: 'none',
        background: off ? 'transparent' : hover || press ? WA_TINT_HOVER : 'transparent',
        color: off ? 'var(--interactive-disabled-fg)' : WA_TEAL,
        boxShadow: focusRing,
        transform: press && !off ? 'scale(var(--press-scale))' : 'none',
        cursor: off ? 'not-allowed' : 'pointer',
        transition: 'var(--transition-control)',
        outline: 'none',
        ...style,
      }}
    >
      <WhatsAppGlyph size={ICON_GLYPH[size]} />
    </button>
  );
}
