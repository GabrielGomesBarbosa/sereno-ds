'use client';

import * as React from 'react';
import { typographyDemos } from './demos/typography';
import { buttonDemos } from './demos/button';
import { iconButtonDemos } from './demos/icon-button';
import { badgeDemos } from './demos/badge';
import { statusDotDemos } from './demos/status-dot';
import { cardDemos } from './demos/card';
import { actionCardDemos } from './demos/action-card';
import { dividerDemos } from './demos/divider';
import { statCardDemos } from './demos/stat-card';
import { avatarDemos } from './demos/avatar';
import { brandDemos } from './demos/brand';
import { menuDemos } from './demos/menu';
import { tableDemos } from './demos/table';
import { inputDemos } from './demos/input';
import { textareaDemos } from './demos/textarea';
import { selectDemos } from './demos/select';
import { autocompleteDemos } from './demos/autocomplete';
import { checkboxDemos } from './demos/checkbox';
import { radioDemos } from './demos/radio';
import { switchDemos } from './demos/switch';
import { fileUploadDemos } from './demos/file-upload';
import { avatarUploadDemos } from './demos/avatar-upload';
import { searchInputDemos } from './demos/search-input';
import { dateTimePickerDemos } from './demos/date-time-picker';
import { datePickerDemos } from './demos/date-picker';
import { dateRangePickerDemos } from './demos/date-range-picker';
import { calendarLegendDemos } from './demos/calendar-legend';
import { topBarDemos } from './demos/top-bar';
import { tabsDemos } from './demos/tabs';
import { bottomNavDemos } from './demos/bottom-nav';
import { sidebarNavDemos } from './demos/sidebar-nav';
import { stepperDemos } from './demos/stepper';
import { paginationDemos } from './demos/pagination';
import { alertDemos } from './demos/alert';
import { toastDemos } from './demos/toast';
import { dialogDemos } from './demos/dialog';
import { skeletonDemos } from './demos/skeleton';
import { emptyStateDemos } from './demos/empty-state';

/**
 * Live demos keyed by component slug, then by example id (matching `Example.id`
 * in catalog.ts).
 */
export const DEMOS: Record<string, Record<string, React.FC>> = {
  typography: typographyDemos,
  button: buttonDemos,
  'icon-button': iconButtonDemos,
  badge: badgeDemos,
  'status-dot': statusDotDemos,
  card: cardDemos,
  'action-card': actionCardDemos,
  divider: dividerDemos,
  'stat-card': statCardDemos,
  avatar: avatarDemos,
  brand: brandDemos,
  menu: menuDemos,
  table: tableDemos,
  input: inputDemos,
  textarea: textareaDemos,
  select: selectDemos,
  autocomplete: autocompleteDemos,
  checkbox: checkboxDemos,
  radio: radioDemos,
  switch: switchDemos,
  'file-upload': fileUploadDemos,
  'avatar-upload': avatarUploadDemos,
  'search-input': searchInputDemos,
  'date-time-picker': dateTimePickerDemos,
  'date-picker': datePickerDemos,
  'date-range-picker': dateRangePickerDemos,
  'calendar-legend': calendarLegendDemos,
  'top-bar': topBarDemos,
  tabs: tabsDemos,
  'bottom-nav': bottomNavDemos,
  'sidebar-nav': sidebarNavDemos,
  stepper: stepperDemos,
  pagination: paginationDemos,
  alert: alertDemos,
  toast: toastDemos,
  dialog: dialogDemos,
  skeleton: skeletonDemos,
  'empty-state': emptyStateDemos,
};
