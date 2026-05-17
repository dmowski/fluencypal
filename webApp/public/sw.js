/* FluencyPal service worker.
 *
 * Strategy:
 *  - Precache a tiny app shell (offline fallback page + key icons).
 *  - Runtime cache-first for immutable Next.js build assets (/_next/static/*).
 *  - Runtime stale-while-revalidate for same-origin static assets in /public.
 *  - Network-first for navigations, falling back to cached page, then /offline.html.
 *  - Network-only for API requests (no caching of auth/data calls).
 */

const CACHE_VERSION = 'v1';
const PRECACHE = `fp-precache-${CACHE_VERSION}`;
const RUNTIME_STATIC = `fp-runtime-static-${CACHE_VERSION}`;
const RUNTIME_PAGES = `fp-runtime-pages-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  '/offline.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/favicon-192x192.png',
  '/favicon-512x512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  const expected = new Set([PRECACHE, RUNTIME_STATIC, RUNTIME_PAGES]);
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => !expected.has(key)).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

const isImmutableNextAsset = (url) =>
  url.origin === self.location.origin && url.pathname.startsWith('/_next/static/');

const isSameOriginStaticAsset = (url) => {
  if (url.origin !== self.location.origin) return false;
  return /\.(?:css|js|woff2?|ttf|otf|eot|png|jpe?g|gif|svg|webp|ico|mp3|mp4|webm|json)$/i.test(
    url.pathname,
  );
};

const isApiRequest = (url) =>
  url.origin === self.location.origin && url.pathname.startsWith('/api/');

const cacheFirst = async (request, cacheName) => {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
};

const staleWhileRevalidate = async (request, cacheName) => {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || networkPromise;
};

const networkFirstPage = async (request) => {
  const cache = await caches.open(RUNTIME_PAGES);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    const offline = await caches.match('/offline.html');
    if (offline) return offline;
    throw err;
  }
};

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (isApiRequest(url)) return; // bypass cache entirely

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstPage(request));
    return;
  }

  if (isImmutableNextAsset(url)) {
    event.respondWith(cacheFirst(request, RUNTIME_STATIC));
    return;
  }

  if (isSameOriginStaticAsset(url)) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_STATIC));
    return;
  }
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
