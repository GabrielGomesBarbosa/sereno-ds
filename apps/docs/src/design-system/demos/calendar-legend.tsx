'use client';

import { CalendarLegend } from '@sereno-ds/ui';
import * as React from 'react';
import { DateTimeDots, LEGEND_ITEMS } from './_shared';

function CalendarLegendBasica() {
  return <CalendarLegend items={LEGEND_ITEMS} />;
}

export const calendarLegendDemos: Record<string, React.FC> = { basic: CalendarLegendBasica, 'with-calendar': DateTimeDots };
