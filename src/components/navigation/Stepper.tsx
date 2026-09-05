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
 * Renders the segment track, then a "Passo N de M" eyebrow above the current
 * step's label. Same visual language as the progress bar in the public booking
 * flow, but with a props contract.
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
        <div style={sx({ display: 'flex', flexDirection: 'column', gap: 2 })}>
          <span
            style={sx({
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
          <span
            style={sx({
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--weight-semibold)',
              letterSpacing: 'var(--tracking-tight)',
              color: 'var(--text-primary)',
              lineHeight: 1.25,
            })}
          >
            {steps[current].label}
          </span>
        </div>
      )}
    </div>
  );
}