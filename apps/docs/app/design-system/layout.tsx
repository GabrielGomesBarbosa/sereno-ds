import type { Metadata } from 'next';
import { Shell } from '@/design-system/Shell';

// The showcase is for the team/investors, not for search engines (SS-39 §D.13).
export const metadata: Metadata = {
  title: 'Design System',
  robots: { index: false, follow: false },
};

export default function DesignSystemLayout({ children }: { children: React.ReactNode }) {
  return <Shell>{children}</Shell>;
}
