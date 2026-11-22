'use client';

import { Avatar } from '@sereno-ds/ui';
import * as React from 'react';
import { row } from './_shared';

function AvatarTamanhos() {
  return (
    <div style={{ ...row, alignItems: 'flex-end' }}>
      <Avatar name="Ana Beatriz Ramos" size="xs" />
      <Avatar name="Ana Beatriz Ramos" size="sm" />
      <Avatar name="Ana Beatriz Ramos" size="md" />
      <Avatar name="Ana Beatriz Ramos" size="lg" />
      <Avatar name="Ana Beatriz Ramos" size="xl" />
    </div>
  );
}

function AvatarIniciais() {
  return (
    <div style={row}>
      <Avatar name="Ana Beatriz Ramos" size="lg" />
      <Avatar name="Carlos Dias" size="lg" />
      <Avatar name="Juliana Prado" size="lg" />
    </div>
  );
}

function AvatarStatus() {
  return (
    <div style={row}>
      <Avatar name="Carlos Dias" size="lg" status="confirmed" />
      <Avatar name="Rafael & Bia" size="lg" status="pending" />
      <Avatar name="Helena Costa" size="lg" status="cancelled" />
    </div>
  );
}

export const avatarDemos: Record<string, React.FC> = { sizes: AvatarTamanhos, 'initials-photo': AvatarIniciais, status: AvatarStatus };
