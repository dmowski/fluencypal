import * as Sentry from '@sentry/nextjs';

/** Same URL key used by Sentry's N+1 detector for Next.js RSC flights. */
export function getRscRequestKey(input: RequestInfo | URL): string | null {
  try {
    const raw =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;
    const url = new URL(raw, typeof window !== 'undefined' ? window.location.origin : 'http://local');
    const rsc = url.searchParams.get('_rsc');
    if (!rsc) return null;
    return `${url.origin}${url.pathname}?_rsc=${rsc}`;
  } catch {
    return null;
  }
}

type InFlightBucket = {
  count: number;
  firstAtMs: number;
  stacks: string[];
  reported: boolean;
};

const DEFAULT_WINDOW_MS = 2_000;
/** Prefetch + navigate commonly hits 2; alert only on pathological bursts (e.g. DARK-LANG-HQ had 4). */
const DEFAULT_THRESHOLD = 3;

/**
 * Detects duplicate identical Next.js RSC (`?_rsc=`) fetches in a short window.
 * Used to diagnose Sentry performance_n_plus_one_api_calls on App Router navigations
 * when the app cannot see Next internals that issue the requests.
 */
export function createRscNPlusOneTracker(options?: {
  windowMs?: number;
  threshold?: number;
  now?: () => number;
  onDuplicate?: (payload: {
    key: string;
    count: number;
    stacks: string[];
    pathname: string;
  }) => void;
}) {
  const windowMs = options?.windowMs ?? DEFAULT_WINDOW_MS;
  const threshold = options?.threshold ?? DEFAULT_THRESHOLD;
  const now = options?.now ?? (() => Date.now());
  const buckets = new Map<string, InFlightBucket>();

  const report =
    options?.onDuplicate ??
    ((payload) => {
      Sentry.addBreadcrumb({
        category: 'rsc-n-plus-one',
        level: 'warning',
        message: 'Duplicate RSC fetch detected',
        data: {
          key: payload.key,
          count: payload.count,
          pathname: payload.pathname,
        },
      });

      Sentry.captureMessage('Duplicate Next.js RSC fetch (possible N+1)', {
        level: 'warning',
        tags: {
          area: 'navigation',
          issue: 'rsc-n-plus-one',
        },
        extra: {
          rscKey: payload.key,
          duplicateCount: payload.count,
          pathname: payload.pathname,
          fetchStacks: payload.stacks.slice(0, 4),
          href: typeof window !== 'undefined' ? window.location.href : null,
          referrer: typeof document !== 'undefined' ? document.referrer : null,
        },
      });
    });

  return {
    track(input: RequestInfo | URL): void {
      const key = getRscRequestKey(input);
      if (!key) return;

      const at = now();
      let bucket = buckets.get(key);
      if (!bucket || at - bucket.firstAtMs > windowMs) {
        bucket = { count: 0, firstAtMs: at, stacks: [], reported: false };
        buckets.set(key, bucket);
      }

      bucket.count += 1;
      if (bucket.stacks.length < 4) {
        bucket.stacks.push(new Error('rsc-fetch').stack ?? '');
      }

      if (bucket.count >= threshold && !bucket.reported) {
        bucket.reported = true;
        report({
          key,
          count: bucket.count,
          stacks: bucket.stacks,
          pathname: typeof window !== 'undefined' ? window.location.pathname : '',
        });
      }
    },
    /** Test helper */
    reset() {
      buckets.clear();
    },
  };
}

let installed = false;

/** Patch window.fetch once; safe to call from client instrumentation. */
export function installRscNPlusOneDiagnostics(): void {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  const tracker = createRscNPlusOneTracker();
  const originalFetch = window.fetch.bind(window);

  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    tracker.track(input);
    return originalFetch(input, init);
  }) as typeof window.fetch;
}
