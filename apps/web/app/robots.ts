import type { MetadataRoute } from 'next';
import { canonicalUrl } from '../lib/public-seo';

export const dynamic = 'force-dynamic';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/account'],
    },
    sitemap: canonicalUrl('/sitemap.xml'),
  };
}
