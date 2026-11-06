import type { MetadataRoute } from 'next';

// Preview build: block all crawlers. At launch, allow everything and add the sitemap.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', disallow: '/' } };
}
