'use client';

import * as React from 'react';
import { Check, Copy } from 'lucide-react';

/** The dark hero code pill with a copy button. `children` is shown; `code` is copied. */
export function CopyCode({ code, children }: { code: string; children: React.ReactNode }) {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        margin: 'var(--space-2) 0 0',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-inverse)',
        color: 'var(--text-inverse)',
      }}
    >
      <pre
        style={{
          margin: 0,
          padding: 'var(--space-3) var(--space-9) var(--space-3) var(--space-4)',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-xs)',
          overflowX: 'auto',
        }}
      >
        {children}
      </pre>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? 'Copied' : 'Copy the import'}
        style={{
          position: 'absolute',
          top: 6,
          right: 6,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 28,
          height: 28,
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          background: 'transparent',
          color: 'currentColor',
          opacity: copied ? 1 : 0.55,
          cursor: 'pointer',
          transition: 'opacity var(--duration-fast) var(--ease-standard)',
        }}
      >
        {copied ? <Check size={15} strokeWidth={2} /> : <Copy size={15} strokeWidth={2} />}
      </button>
    </div>
  );
}
