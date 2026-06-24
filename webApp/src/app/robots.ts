import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { isBookHost } from '@/features/SEO/hosts';
import { getAppHostRobots, getBookHostRobots } from '@/features/Reader/Landing/bookSeo';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get('host');
  return isBookHost(host) ? getBookHostRobots() : getAppHostRobots();
}
