import type { MetadataRoute } from 'next';
import { bookLandingSiteUrl } from './landingSettings';

export const bookLandingPath = '/landing';
export const bookLandingAbsoluteUrl = `${bookLandingSiteUrl}landing`;
export const bookLandingSitemapLastMod = '2026-06-24T00:00:00.000Z';

export function getBookLandingSitemapEntries(): MetadataRoute.Sitemap {
  return [
    {
      url: bookLandingAbsoluteUrl,
      lastModified: new Date('2026-06-24'),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}

export function generateBookSitemapXml(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url>
<loc>${bookLandingAbsoluteUrl}</loc>
<lastmod>${bookLandingSitemapLastMod}</lastmod>
<changefreq>monthly</changefreq>
<priority>1.0000</priority>
</url>
</urlset>`;
}

export function getBookHostRobots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: bookLandingPath,
      disallow: '/',
    },
    sitemap: `${bookLandingSiteUrl}sitemap.xml`,
  };
}

/** Default webApp host policy: keep the practice/book app out of search indexes. */
export function getAppHostRobots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      disallow: '/',
    },
  };
}

export function getBookLandingStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'FluencyPal Books – Read, Translate & Learn English',
    description:
      'Upload EPUBs, translate words instantly, highlight passages, listen with text-to-speech, and sync your reading library across devices.',
    url: bookLandingAbsoluteUrl,
    isPartOf: {
      '@type': 'WebSite',
      name: 'FluencyPal Books',
      url: bookLandingSiteUrl,
    },
    about: {
      '@type': 'SoftwareApplication',
      name: 'FluencyPal Books',
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
  };
}
