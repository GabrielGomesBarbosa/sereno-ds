'use client';

import { IconButton } from '@sereno-ds/ui';
import {
  Check,
  ChevronLeft,
  Flag,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import * as React from 'react';
import { row } from './_shared';

function IconButtonVariantes() {
  return (
    <div style={row}>
      <IconButton label="Back">
        <ChevronLeft size={18} strokeWidth={1.75} />
      </IconButton>
      <IconButton label="Search" variant="secondary">
        <Search size={18} strokeWidth={1.75} />
      </IconButton>
      <IconButton label="New" variant="primary">
        <Plus size={18} strokeWidth={1.75} />
      </IconButton>
    </div>
  );
}

function IconButtonTamanhos() {
  return (
    <div style={row}>
      <IconButton label="Previous" size="sm">
        <ChevronLeft size={16} strokeWidth={1.75} />
      </IconButton>
      <IconButton label="Previous" size="md">
        <ChevronLeft size={18} strokeWidth={1.75} />
      </IconButton>
      <IconButton label="Previous" size="lg">
        <ChevronLeft size={20} strokeWidth={1.75} />
      </IconButton>
    </div>
  );
}

function IconButtonSemantic() {
  return (
    <div style={row}>
      <IconButton label="Approve" variant="success">
        <Check size={18} strokeWidth={1.75} />
      </IconButton>
      <IconButton label="Flag" variant="warning">
        <Flag size={18} strokeWidth={1.75} />
      </IconButton>
      <IconButton label="Delete" variant="error">
        <Trash2 size={18} strokeWidth={1.75} />
      </IconButton>
    </div>
  );
}

function IconButtonDesabilitado() {
  return (
    <div style={row}>
      <IconButton label="Back" disabled>
        <ChevronLeft size={18} strokeWidth={1.75} />
      </IconButton>
      <IconButton label="Search" variant="secondary" disabled>
        <Search size={18} strokeWidth={1.75} />
      </IconButton>
      <IconButton label="New" variant="primary" disabled>
        <Plus size={18} strokeWidth={1.75} />
      </IconButton>
    </div>
  );
}

export const iconButtonDemos: Record<string, React.FC> = {
    variants: IconButtonVariantes,
    semantic: IconButtonSemantic,
    sizes: IconButtonTamanhos,
    disabled: IconButtonDesabilitado,
  };
