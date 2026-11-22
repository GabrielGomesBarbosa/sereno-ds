'use client';

import { Skeleton } from '@sereno-ds/ui';
import * as React from 'react';
import { col, row } from './_shared';

function SkeletonVariantes() {
  return (
    <div style={{ ...col, maxWidth: 460 }}>
      <Skeleton variant="text" />
      <Skeleton variant="card" />
      <div style={row}>
        <Skeleton variant="avatar" />
        <Skeleton variant="block" width={220} height={64} />
      </div>
    </div>
  );
}

function SkeletonLinhas() {
  return (
    <div style={{ ...col, maxWidth: 460 }}>
      <Skeleton variant="text" lines={2} />
      <Skeleton variant="block" width={220} height={64} />
    </div>
  );
}

export const skeletonDemos: Record<string, React.FC> = { variants: SkeletonVariantes, lines: SkeletonLinhas };
