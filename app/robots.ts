import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

const SITE = 'https://sereno-ds.netlify.app';

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
