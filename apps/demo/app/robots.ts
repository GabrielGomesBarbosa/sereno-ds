import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

const SITE = process.env.NEXT_PUBLIC_DEMO_URL ?? 'http://localhost:3001';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // The component showcase is an internal vitrine, not for indexing (SS-39 §D.13).
        disallow: '/design-system',
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
