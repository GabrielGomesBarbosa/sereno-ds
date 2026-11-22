'use client';

import { Typography } from '@sereno-ds/ui';
import * as React from 'react';
import { col, row } from './_shared';

function TypographyVariantes() {
  return (
    <div style={col}>
      <Typography variant="display">Display</Typography>
      <Typography variant="h1">Heading 1</Typography>
      <Typography variant="h2">Heading 2</Typography>
      <Typography variant="h3">Heading 3</Typography>
      <Typography variant="body">Body: the default paragraph text.</Typography>
      <Typography variant="bodySm">Body small: secondary paragraph text.</Typography>
      <Typography variant="label">Label</Typography>
      <Typography variant="caption">Caption</Typography>
      <Typography variant="eyebrow">Eyebrow</Typography>
    </div>
  );
}

function TypographyCores() {
  return (
    <div style={row}>
      <Typography variant="label" color="brand">
        Brand
      </Typography>
      <Typography variant="label" color="accent">
        Accent
      </Typography>
      <Typography variant="label" color="error">
        Error
      </Typography>
      <Typography variant="label" color="success">
        Success
      </Typography>
      <Typography variant="label" color="muted">
        Muted
      </Typography>
      <div style={{ background: 'var(--interactive-primary)', color: 'var(--interactive-primary-fg)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)' }}>
        <Typography variant="label" color="inherit">
          Takes the strip&apos;s color
        </Typography>
      </div>
    </div>
  );
}

function TypographyComoTag() {
  return (
    <Typography variant="h3" as="div">
      Looks like a heading, isn&rsquo;t one in the outline
    </Typography>
  );
}

function TypographyTruncate() {
  return (
    <div style={{ maxWidth: 220 }}>
      <Typography variant="label" truncate>
        A title long enough to need clipping in a narrow card
      </Typography>
    </div>
  );
}

function TypographyNumeric() {
  return (
    <div style={row}>
      <Typography variant="display" numeric>
        A002
      </Typography>
      <Typography variant="h1" color="brand" numeric>
        11:00
      </Typography>
    </div>
  );
}

export const typographyDemos: Record<string, React.FC> = {
    variants: TypographyVariantes,
    colors: TypographyCores,
    as: TypographyComoTag,
    truncate: TypographyTruncate,
    numeric: TypographyNumeric,
  };
