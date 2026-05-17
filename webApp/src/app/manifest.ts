import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';

const isBookHost = (host: string | null): boolean => {
  if (!host) return false;
  return host.split(':')[0].toLowerCase().startsWith('book.');
};

const practiceManifest: MetadataRoute.Manifest = {
  id: '/?source=pwa-app',
  name: 'FluencyPal',
  short_name: 'FluencyPal',
  description: 'AI Speaking Practice for Fluency & Confidence',
  start_url: '/',
  scope: '/',
  display: 'standalone',
  orientation: 'portrait',
  background_color: '#0a121e',
  theme_color: '#0a121e',
  icons: [
    { src: '/favicon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/favicon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    {
      src: '/favicon-512x512-white-bg.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable',
    },
  ],
};

const bookManifest: MetadataRoute.Manifest = {
  id: '/?source=pwa-book',
  name: 'FluencyPal Reader',
  short_name: 'Reader',
  description: 'Read books',
  start_url: '/',
  scope: '/',
  display: 'standalone',
  orientation: 'portrait',
  background_color: '#F4E1C6',
  theme_color: '#F4E1C6',
  icons: [
    { src: '/favicon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/favicon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    {
      src: '/favicon-512x512-white-bg.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable',
    },
  ],
};

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const host = (await headers()).get('host');
  return isBookHost(host) ? bookManifest : practiceManifest;
}
