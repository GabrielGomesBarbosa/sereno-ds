import * as React from 'react';

export interface SidebarNavContextValue {
  value?: string;
  /** The root's `disabled` - what an `Item` falls back to when it doesn't set its own. */
  disabled: boolean;
  /** Closes any open flyout, then calls the root's `onChange`. What `Item` / `SubItem` call on click. */
  select: (value: string) => void;
  collapsed: boolean;
  linkComponent?: React.ElementType;
  /** Which item's collapsed-rail flyout is open, if any - single, cross-item (opening one closes another). */
  flyoutValue: string | null;
  openFlyout: (value: string) => void;
  closeFlyoutSoon: () => void;
  closeFlyoutNow: () => void;
  showTip: (label: string, rect: DOMRect) => void;
  hideTip: () => void;
}

export const SidebarNavContext = React.createContext<SidebarNavContextValue | null>(null);

/** An `Item`'s effective `disabled`, handed to its `SubItem`s so they inherit from their parent (which itself inherited the root's). */
export const ParentDisabledContext = React.createContext<boolean | undefined>(undefined);

export function useSidebarNavContext(component: string): SidebarNavContextValue {
  const ctx = React.useContext(SidebarNavContext);
  if (!ctx) throw new Error(`<SidebarNav.${component}> must be rendered inside <SidebarNav>.`);
  return ctx;
}
