import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { isBookHost } from '@/features/SEO/hosts';
import { getBookLandingSitemapEntries } from '@/features/Reader/Landing/bookSeo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const host = (await headers()).get('host');
  if (!isBookHost(host)) {
    return [];
  }

  return getBookLandingSitemapEntries();
}
