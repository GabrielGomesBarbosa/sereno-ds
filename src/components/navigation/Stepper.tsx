'use client';

import * as React from 'react';
import { sx } from '../_internal/style';

export interface StepperStep {
  /** Stable identifier; falls back to the array index when omitted. */
  value?: string;
  /** Short label — shown next to the "Passo N de M" counter for the current step. */
  label: string;
}

/**
 * Progress indicator for a linear multi-step flow (onboarding, guided setup).
 * Renders the segment track plus a "Passo N de M · <label>" line (a dot
 * separates the counter from the current step's label). Same visual language as
 * the progress bar in the public booking flow, but with a props contract.
 */
export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: StepperStep[];
  /** Zero-based index of the active step. */
  current?: number;
  /** When provided, completed and current steps become clickable (back-navigation only). */
  onStepClick?: (index: number) => void;
  /** `bar` = full-width segments (desktop wizards). `dots` = compact pills (mobile). */
  variant?: 'bar' | 'dots';
}

export function Stepper({ steps = [], current = 0, onStepClick, variant = 'bar', style, ...rest }: StepperProps) {
  const dots = variant === 'dots';
  const clickable = typeof onStepClick === 'function';
  return (
    <div {...rest} style={sx({ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', ...style })}>
      <div style={sx({ display: 'flex', gap: dots ? 'var(--space-2)' : 'var(--space-1)', alignItems: 'center' })}>
        {steps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          const reachable = clickable && i <= current;
          const common = {
            flex: dots ? '0 0 auto' : 1,
            border: 'none',
            padding: 0,
            cursor: reachable ? 'pointer' : 'default',
            background: done || active ? 'var(--interactive-primary)' : 'var(--border-default)',
            transition: 'background-color var(--duration-normal) var(--ease-standard)',
          };
          return dots ? (
            <button
              key={s.value || i}
              aria-label={s.label}
              aria-current={active ? 'step' : undefined}
              disabled={!reachable}
              onClick={() => reachable && onStepClick && onStepClick(i)}
              style={sx({ ...common, width: active ? 24 : 8, height: 8, borderRadius: 'var(--radius-pill)' })}
            />
          ) : (
            <button
              key={s.value || i}
              aria-label={s.label}
              aria-current={active ? 'step' : undefined}
              disabled={!reachable}
              onClick={() => reachable && onStepClick && onStepClick(i)}
              style={sx({ ...common, height: 3, borderRadius: 'var(--radius-pill)' })}
            />
          );
        })}
      </div>
      {steps[current] && (
        <div style={sx({ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', minWidth: 0 })}>
          <span
            style={sx({
              flex: '0 0 auto',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-2xs)',
              fontWeight: 'var(--weight-bold)',
              letterSpacing: 'var(--tracking-wide)',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
            })}
          >
            Passo {current + 1} de {steps.length}
          </span>
          <span aria-hidden style={sx({ flex: '0 0 auto', width: 3, height: 3, borderRadius: '999px', background: 'var(--border-strong)' })} />
          <span
            style={sx({
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-semibold)',
              color: 'var(--text-primary)',
            })}
          >
            {steps[current].label}
          </span>
        </div>
      )}
    </div>
  );
}