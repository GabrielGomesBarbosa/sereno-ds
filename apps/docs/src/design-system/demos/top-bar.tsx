'use client';

import { Brand, IconButton, TopBar } from '@sereno-ds/ui';
import { Bell, ChevronLeft, Share2 } from 'lucide-react';
import * as React from 'react';
import { BodyLines, PhoneFrame, screenBody } from './_shared';

function TopBarBasico() {
  return (
    <PhoneFrame>
      <TopBar sticky={false}>
        <TopBar.Leading>
          <IconButton label="Back">
            <ChevronLeft size={18} strokeWidth={1.75} />
          </IconButton>
        </TopBar.Leading>
        <TopBar.Title>Your details</TopBar.Title>
      </TopBar>
      <div style={screenBody}>
        <BodyLines />
      </div>
    </PhoneFrame>
  );
}

function TopBarCompleto() {
  return (
    <PhoneFrame>
      <TopBar sticky={false}>
        <TopBar.Leading>
          <IconButton label="Back">
            <ChevronLeft size={18} strokeWidth={1.75} />
          </IconButton>
        </TopBar.Leading>
        <TopBar.Title subtitle="Therapy session">Pick a time</TopBar.Title>
        <TopBar.Actions>
          <IconButton label="Notifications">
            <Bell size={18} strokeWidth={1.75} />
          </IconButton>
        </TopBar.Actions>
      </TopBar>
      <div style={screenBody}>
        <BodyLines />
      </div>
    </PhoneFrame>
  );
}

function TopBarTransparente() {
  return (
    <PhoneFrame style={{ background: 'var(--bg-brand-soft)' }}>
      <TopBar transparent sticky={false}>
        <TopBar.Leading>
          <Brand variant="lockup" size={20} />
        </TopBar.Leading>
        <TopBar.Actions>
          <IconButton label="Share" variant="secondary">
            <Share2 size={18} strokeWidth={1.75} />
          </IconButton>
        </TopBar.Actions>
      </TopBar>
      <div style={{ ...screenBody, background: 'var(--bg-brand-soft)' }}>
        <BodyLines />
      </div>
    </PhoneFrame>
  );
}

export const topBarDemos: Record<string, React.FC> = { basic: TopBarBasico, full: TopBarCompleto, transparent: TopBarTransparente };
