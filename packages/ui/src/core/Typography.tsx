'use client';

import * as React from 'react';
import { sx } from '../_internal/style';

export type TypographyVariant = 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'bodySm' | 'label' | 'caption' | 'eyebrow';
export type TypographyColor = 'primary' | 'secondary' | 'muted' | 'disabled' | 'inverse' | 'brand' | 'accent' | 'link' | 'error';

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant;
  /** Overrides the variant's own default color token. */
  color?: TypographyColor;
  /** Render as a different element than the variant's own default tag — e.g. an
   *  `h3`-styled label that should not enter the document's heading outline. */
  as?: React.ElementType;
  /** Single-line ellipsis. Needs a width-constrained ancestor to actually clip. */
  truncate?: boolean;
  children?: React.ReactNode;
}

const VARIANTS: Record<TypographyVariant, { as: React.ElementType; style: React.CSSProperties }> = {
  display: {
    as: 'h1',
    style: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-5xl)', fontWeight: 'var(--weight-extrabold)', letterSpacing: 'var(--tracking-tight)', lineHeight: 'var(--leading-tight)' },
  },
  h1: {
    as: 'h1',
    style: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-bold)', letterSpacing: 'var(--tracking-tight)', lineHeight: 'var(--leading-tight)' },
  },
  h2: {
    as: 'h2',
    style: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-bold)', letterSpacing: 'var(--tracking-snug)', lineHeight: 'var(--leading-tight)' },
  },
  h3: {
    as: 'h3',
    style: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-md)', fontWeight: 'var(--weight-bold)', letterSpacing: 'var(--tracking-snug)', lineHeight: 'var(--leading-snug)' },
  },
  body: {
    as: 'p',
    style: { fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', fontWeight: 'var(--weight-regular)', lineHeight: 'var(--leading-normal)' },
  },
  bodySm: {
    as: 'p',
    style: { fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-regular)', lineHeight: 'var(--leading-normal)' },
  },
  label: {
    as: 'span',
    style: { fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', letterSpacing: 'var(--tracking-snug)', lineHeight: 'var(--leading-snug)' },
  },
  caption: {
    as: 'span',
    style: { fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-regular)', lineHeight: 'var(--leading-normal)' },
  },
  eyebrow: {
    as: 'span',
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-2xs)',
      fontWeight: 'var(--weight-semibold)',
      letterSpacing: 'var(--tracking-caps)',
      textTransform: 'uppercase',
      lineHeight: 'var(--leading-normal)',
    },
  },
};

// Each variant's own sensible default — overridable via the `color` prop.
const DEFAULT_COLOR: Record<TypographyVariant, TypographyColor> = {
  display: 'primary',
  h1: 'primary',
  h2: 'primary',
  h3: 'primary',
  body: 'primary',
  bodySm: 'secondary',
  label: 'primary',
  caption: 'muted',
  eyebrow: 'muted',
};

const COLOR_TOKEN: Record<TypographyColor, string> = {
  primary: '--text-primary',
  secondary: '--text-secondary',
  muted: '--text-muted',
  disabled: '--text-disabled',
  inverse: '--text-inverse',
  brand: '--text-brand',
  accent: '--text-accent',
  link: '--text-link',
  error: '--interactive-error',
};

/**
 * Text primitive — one place for the type-scale/font-family/weight combos
 * every screen otherwise reconstructs by hand (see `/design-system/tokens`
 * for the raw scale this wraps). `variant` picks the look *and* the default
 * semantic tag; `as` overrides just the tag, `color` just the color, so a
 * heading-styled label that isn't really a document heading, or a caption in
 * the brand color, are one-prop changes, not a new style object.
 */
export function Typography({ variant = 'body', color, as, truncate, style, children, ...rest }: TypographyProps) {
  const v = VARIANTS[variant];
  const Tag = as ?? v.as;
  return (
    <Tag
      {...rest}
      style={sx({
        margin: 0,
        ...v.style,
        color: 'var(' + COLOR_TOKEN[color ?? DEFAULT_COLOR[variant]] + ')',
        // `overflow`/`textOverflow` are no-ops on a plain inline box (the
        // default for the `span`-tagged variants) — `block` makes the
        // element actually respect a constrained-width ancestor.
        ...(truncate ? { display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } : null),
        ...style,
      })}
    >
      {children}
    </Tag>
  );
}
