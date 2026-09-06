import type { MetadataRoute } from 'next';
import { PROFESSIONALS } from '@/lib/mock';

export const dynamic = 'force-static';

const SITE = process.env.NEXT_PUBLIC_DEMO_URL ?? 'http://localhost:3001';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = ['', '/dashboard', '/onboarding'].map((path) => ({
    url: `${SITE}${path}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: path === '' ? 1 : 0.7,
  }));

  const bookingRoutes = PROFESSIONALS.map((p) => ({
    url: `${SITE}/agendar/${p.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // /design-system is intentionally excluded (noindex vitrine).
  return [...staticRoutes, ...bookingRoutes];
}
