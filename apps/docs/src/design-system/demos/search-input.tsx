'use client';

import * as React from 'react';
import { SearchInput } from '@sereno-ds/ui';
import { col, fieldCol } from './_shared';

const PEOPLE = ['Emma Johnson', 'James Smith', 'Olivia Brown', 'Michael Davis', 'Sophia Wilson', 'William Miller'];

function SearchInputBasico() {
  const [last, setLast] = React.useState('');
  return (
    <div style={{ ...fieldCol, gap: 8 }}>
      <SearchInput placeholder="Search clients" onSearch={setLast} />
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>onSearch: {last ? `"${last}"` : '-'}</span>
    </div>
  );
}

function SearchInputLive() {
  const [q, setQ] = React.useState('');
  const rows = q ? PEOPLE.filter((p) => p.toLowerCase().includes(q.toLowerCase())) : PEOPLE;
  return (
    <div style={{ ...fieldCol, gap: 12 }}>
      <SearchInput placeholder="Filter names" onSearch={setQ} />
      {rows.length === 0 ? (
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Nothing for “{q}”.</span>
      ) : (
        <div style={col}>
          {rows.map((p) => (
            <span key={p} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
              {p}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function SearchInputTamanhos() {
  return (
    <div style={fieldCol}>
      <SearchInput size="sm" placeholder="Search" />
      <SearchInput size="md" placeholder="Search" />
      <SearchInput size="lg" placeholder="Search" />
    </div>
  );
}

function SearchInputDesabilitado() {
  return (
    <div style={fieldCol}>
      <SearchInput placeholder="Search" defaultValue="emma johnson" disabled />
    </div>
  );
}

export const searchInputDemos: Record<string, React.FC> = {
    basic: SearchInputBasico,
    live: SearchInputLive,
    sizes: SearchInputTamanhos,
    disabled: SearchInputDesabilitado,
  };
