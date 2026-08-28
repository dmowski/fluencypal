export const SCROLL_BUCKETS = [25, 50, 75, 100] as const;
export type ScrollBucket = (typeof SCROLL_BUCKETS)[number];

export const currentScrollPercent = (): number => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return 0;
  const root = document.documentElement;
  const max = root.scrollHeight - window.innerHeight;
  if (max <= 0) return 100;
  return Math.max(0, Math.min(100, Math.round((window.scrollY / max) * 100)));
};

export const nextScrollBucket = (previousMax: number, current: number): ScrollBucket | null => {
  for (const bucket of SCROLL_BUCKETS) {
    if (current >= bucket && previousMax < bucket) return bucket;
  }
  return null;
};
