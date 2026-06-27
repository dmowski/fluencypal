import type { MetadataRoute } from 'next';
import {
  bookLandingDescription,
  bookLandingFaqItems,
  bookLandingFeatures,
  bookLandingTitle,
} from './landingData';
import {
  bookLandingDemoScreenshot,
  bookLandingSiteUrl,
} from './landingSettings';

export const bookLandingPath = '/landing';
export const bookLandingAbsoluteUrl = `${bookLandingSiteUrl}landing`;
export const bookLandingSitemapLastMod = '2026-06-27T00:00:00.000Z';

const organizationId = `${bookLandingSiteUrl}#organization`;
const websiteId = `${bookLandingSiteUrl}#website`;
const softwareId = `${bookLandingSiteUrl}#software`;
const faqId = `${bookLandingAbsoluteUrl}#faq`;

export function getBookLandingSitemapEntries(): MetadataRoute.Sitemap {
  return [
    {
      url: bookLandingAbsoluteUrl,
      lastModified: new Date('2026-06-27'),
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
  const faqEntities = bookLandingFaqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  }));

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': organizationId,
        name: 'FluencyPal',
        url: 'https://app.fluencypal.com/',
        logo: {
          '@type': 'ImageObject',
          url: `${bookLandingSiteUrl}logo192.png`,
        },
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        name: 'FluencyPal Books',
        url: bookLandingSiteUrl,
        publisher: { '@id': organizationId },
      },
      {
        '@type': 'WebPage',
        '@id': bookLandingAbsoluteUrl,
        url: bookLandingAbsoluteUrl,
        name: bookLandingTitle,
        headline: 'Read, translate, and learn English from any book',
        description: bookLandingDescription,
        inLanguage: 'en',
        isPartOf: { '@id': websiteId },
        about: { '@id': softwareId },
        mainEntity: { '@id': faqId },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': softwareId,
        name: 'FluencyPal Books',
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Web',
        url: bookLandingSiteUrl,
        description: bookLandingDescription,
        featureList: bookLandingFeatures.map((feature) => feature.title),
        screenshot: bookLandingDemoScreenshot,
        isAccessibleForFree: true,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        publisher: { '@id': organizationId },
      },
      {
        '@type': 'FAQPage',
        '@id': faqId,
        url: bookLandingAbsoluteUrl,
        mainEntity: faqEntities,
      },
    ],
  };
}
