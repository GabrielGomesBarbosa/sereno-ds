// Server-safe catalogue of the Design System primitives. Powers the sidebar,
// the /design-system index and `generateStaticParams` for the per-component routes.
// Prop rows are transcribed from each component's .d.ts contract.

import { SEMANTIC_TONES } from './catalog/_shared';
import { typographyMeta } from './catalog/typography';
import { buttonMeta } from './catalog/button';
import { iconButtonMeta } from './catalog/icon-button';
import { badgeMeta } from './catalog/badge';
import { statusDotMeta } from './catalog/status-dot';
import { cardMeta } from './catalog/card';
import { actionCardMeta } from './catalog/action-card';
import { statCardMeta } from './catalog/stat-card';
import { dividerMeta } from './catalog/divider';
import { avatarMeta } from './catalog/avatar';
import { brandMeta } from './catalog/brand';
import { menuMeta } from './catalog/menu';
import { tableMeta } from './catalog/table';
import { inputMeta } from './catalog/input';
import { textareaMeta } from './catalog/textarea';
import { selectMeta } from './catalog/select';
import { autocompleteMeta } from './catalog/autocomplete';
import { checkboxMeta } from './catalog/checkbox';
import { radioMeta } from './catalog/radio';
import { switchMeta } from './catalog/switch';
import { dateTimePickerMeta } from './catalog/date-time-picker';
import { datePickerMeta } from './catalog/date-picker';
import { calendarLegendMeta } from './catalog/calendar-legend';
import { fileUploadMeta } from './catalog/file-upload';
import { avatarUploadMeta } from './catalog/avatar-upload';
import { searchInputMeta } from './catalog/search-input';
import { topBarMeta } from './catalog/top-bar';
import { tabsMeta } from './catalog/tabs';
import { bottomNavMeta } from './catalog/bottom-nav';
import { sidebarNavMeta } from './catalog/sidebar-nav';
import { stepperMeta } from './catalog/stepper';
import { paginationMeta } from './catalog/pagination';
import { alertMeta } from './catalog/alert';
import { toastMeta } from './catalog/toast';
import { dialogMeta } from './catalog/dialog';
import { skeletonMeta } from './catalog/skeleton';
import { emptyStateMeta } from './catalog/empty-state';

export { SEMANTIC_TONES };

export type CategoryId = 'core' | 'forms' | 'navigation' | 'feedback';

export interface PropRow {
  name: string;
  type: string;
  default?: string;
  description: string;
}

/** One named example on a component page: a live demo (keyed by `id` in `demos/<slug>.tsx`) + its snippet. */
export interface Example {
  id: string;
  title: string;
  description?: string;
  code: string;
}

export interface Guidelines {
  do: string[];
  dont: string[];
}

export interface ComponentMeta {
  slug: string;
  name: string;
  category: CategoryId;
  summary: string;
  props: PropRow[];
  /** Single usage snippet - fallback for components not yet broken into `examples`. */
  code: string;
  /** MUI-style example sections. When present, the page renders these instead of `code`. */
  examples?: Example[];
  guidelines?: Guidelines;
}

export const CATEGORIES: { id: CategoryId; label: string; blurb: string }[] = [
  { id: 'core', label: 'Core', blurb: 'Actions, status pills and identity.' },
  { id: 'forms', label: 'Forms', blurb: 'Fields, selects, toggles and the calendar.' },
  { id: 'navigation', label: 'Navigation', blurb: 'Headers, tabs and progress.' },
  { id: 'feedback', label: 'Feedback', blurb: 'Notices, confirmations and loading.' },
];

export const COMPONENTS: ComponentMeta[] = [
  // ── core ──────────────────────────────────────────────────────────────────
  typographyMeta,
  buttonMeta,
  iconButtonMeta,
  badgeMeta,
  statusDotMeta,
  cardMeta,
  actionCardMeta,
  statCardMeta,
  dividerMeta,
  avatarMeta,
  brandMeta,
  menuMeta,
  tableMeta,
  // ── forms ─────────────────────────────────────────────────────────────────
  inputMeta,
  textareaMeta,
  selectMeta,
  autocompleteMeta,
  checkboxMeta,
  radioMeta,
  switchMeta,
  dateTimePickerMeta,
  datePickerMeta,
  calendarLegendMeta,
  fileUploadMeta,
  avatarUploadMeta,
  searchInputMeta,
  // ── navigation ────────────────────────────────────────────────────────────
  topBarMeta,
  tabsMeta,
  bottomNavMeta,
  sidebarNavMeta,
  stepperMeta,
  paginationMeta,
  // ── feedback ──────────────────────────────────────────────────────────────
  alertMeta,
  toastMeta,
  dialogMeta,
  skeletonMeta,
  emptyStateMeta,
];

export function getComponent(category: string, slug: string): ComponentMeta | undefined {
  return COMPONENTS.find((c) => c.category === category && c.slug === slug);
}

export function componentsByCategory(id: CategoryId): ComponentMeta[] {
  return COMPONENTS.filter((c) => c.category === id);
}

/** Previous / next component in the flat catalogue order - for the page footer nav. */
export function adjacentComponents(slug: string): { prev?: ComponentMeta; next?: ComponentMeta } {
  const i = COMPONENTS.findIndex((c) => c.slug === slug);
  if (i === -1) return {};
  return { prev: COMPONENTS[i - 1], next: COMPONENTS[i + 1] };
}

/** Example sections for the page - the real list, or a single fallback from `code`. */
export function examplesFor(meta: ComponentMeta): Example[] {
  return meta.examples ?? [{ id: 'example', title: 'Example', code: meta.code }];
}
