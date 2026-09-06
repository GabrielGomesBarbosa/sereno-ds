import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

// The showcase is internal — keep it out of search indexes entirely.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', disallow: '/' },
  };
}
