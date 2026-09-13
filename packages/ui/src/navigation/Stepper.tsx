'use client';

import * as React from 'react';
import { sx } from '../_internal/style';

/**
 * Progress indicator for a linear multi-step flow — a **compound component**
 * (onboarding, guided setup). Renders the segment track plus a
 * `<counter> · <label>` line (a dot separates the counter from the current
 * step's label). The counter defaults to `Step N of M` — the DS ships no
 * localised copy; pass `stepLabel` for another language.
 *
 * ```tsx
 * <Stepper current={step} onStepClick={setStep}>
 *   <Stepper.Step label="Your profile" />
 *   <Stepper.Step label="First service" />
 *   <Stepper.Step label="Your schedule" />
 * </Stepper>
 * ```
 */
export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Zero-based index of the active step. */
  current?: number;
  /** When provided, completed and current steps become clickable (back-navigation only). */
  onStepClick?: (index: number) => void;
  /** `bar` = full-width segments (desktop wizards). `dots` = compact pills (mobile). */
  variant?: 'bar' | 'dots';
  /**
   * Formats the step counter (both args 1-based / total). Default:
   * `` `Step ${current} of ${total}` ``. Return `null` to drop the counter and
   * show only the current step's `label`.
   */
  stepLabel?: (current: number, total: number) => React.ReactNode;
  children: React.ReactNode;
}

export interface StepperStepProps {
  /** Stable identifier — not read by `Stepper` itself, only for the caller's own use (e.g. a React `key`). */
  value?: string;
  /** Short label — shown next to the step counter while this step is active. */
  label: string;
  /** Set by the root via `cloneElement` — this step's position among its siblings. Not for consumers to pass. */
  index?: number;
}

interface StepperContextValue {
  current: number;
  onStepClick?: (index: number) => void;
  variant: 'bar' | 'dots';
}

const defaultStepLabel = (current: number, total: number) => `Step ${current} of ${total}`;

const StepperContext = React.createContext<StepperContextValue | null>(null);

function useStepperContext(component: string): StepperContextValue {
  const ctx = React.useContext(StepperContext);
  if (!ctx) throw new Error(`<Stepper.${component}> must be rendered inside <Stepper>.`);
  return ctx;
}

function StepperRoot({ current = 0, onStepClick, variant = 'bar', stepLabel = defaultStepLabel, children, style, ...rest }: StepperProps) {
  const dots = variant === 'dots';
  // Steps render their own segment (DOM order does the layout, like `Tabs.Tab`);
  // the root only needs each one's position (to compare against `current`) and,
  // for the line below the track, the active one's `label`.
  const items = React.Children.toArray(children) as React.ReactElement<StepperStepProps>[];
  const activeLabel = items[current]?.props.label;

  const ctx: StepperContextValue = { current, onStepClick, variant };

  return (
    <StepperContext.Provider value={ctx}>
      <div {...rest} style={sx({ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', ...style })}>
        <div style={sx({ display: 'flex', gap: dots ? 'var(--space-2)' : 'var(--space-1)', alignItems: 'center' })}>
          {items.map((child, i) => React.cloneElement(child, { index: i, key: child.key ?? i }))}
        </div>
        {activeLabel !== undefined && (
          <div
            key={current}
            style={sx({
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              minWidth: 0,
              animation: 'sereno-fade-in var(--duration-fast) var(--ease-out)',
            })}
          >
            {(() => {
              const counter = stepLabel(current + 1, items.length);
              return counter == null ? null : (
                <>
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
                    {counter}
                  </span>
                  <span aria-hidden style={sx({ flex: '0 0 auto', width: 3, height: 3, borderRadius: '999px', background: 'var(--border-strong)' })} />
                </>
              );
            })()}
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
              {activeLabel}
            </span>
          </div>
        )}
      </div>
    </StepperContext.Provider>
  );
}

function Step({ label, index }: StepperStepProps) {
  const { current, onStepClick, variant } = useStepperContext('Step');
  const dots = variant === 'dots';
  const i = index ?? 0;
  const done = i < current;
  const active = i === current;
  const reachable = typeof onStepClick === 'function' && i <= current;
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
      aria-label={label}
      aria-current={active ? 'step' : undefined}
      disabled={!reachable}
      onClick={() => reachable && onStepClick!(i)}
      style={sx({
        ...common,
        width: active ? 24 : 8,
        height: 8,
        borderRadius: 'var(--radius-pill)',
        transition: `${common.transition}, width var(--duration-normal) var(--ease-standard)`,
      })}
    />
  ) : (
    <button
      aria-label={label}
      aria-current={active ? 'step' : undefined}
      disabled={!reachable}
      onClick={() => reachable && onStepClick!(i)}
      style={sx({ ...common, height: 3, borderRadius: 'var(--radius-pill)' })}
    />
  );
}

export const Stepper = Object.assign(StepperRoot, { Step });
