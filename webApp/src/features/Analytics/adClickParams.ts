const AD_CLICK_KEYS = ['gclid', 'gbraid', 'wbraid'] as const;
const AD_CLICK_STORAGE_KEY = 'fp_ad_click';

export type AdClickStore = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

const readStored = (store: AdClickStore): Record<string, string> => {
  try {
    const raw = store.getItem(AD_CLICK_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const stored: Record<string, string> = {};
    for (const key of AD_CLICK_KEYS) {
      const value = (parsed as Record<string, unknown>)[key];
      if (typeof value === 'string' && value.trim()) stored[key] = value.trim();
    }
    return stored;
  } catch {
    return {};
  }
};

const clickParamsFromUrl = (href: string): Record<string, string> => {
  try {
    const url = new URL(href, 'https://app.fluencypal.com');
    const found: Record<string, string> = {};
    for (const key of AD_CLICK_KEYS) {
      const value = url.searchParams.get(key)?.trim();
      if (value) found[key] = value;
    }
    return found;
  } catch {
    return {};
  }
};

export const captureAdClick = (href: string, store: AdClickStore): void => {
  const found = clickParamsFromUrl(href);
  if (Object.keys(found).length === 0) return;
  store.setItem(AD_CLICK_STORAGE_KEY, JSON.stringify({ ...readStored(store), ...found }));
};

/** URL with the stored ad click id filled in, or null when nothing needs adding. */
export const adClickUrl = (href: string, store: AdClickStore): string | null => {
  const stored = readStored(store);
  if (Object.keys(stored).length === 0) return null;
  try {
    const url = new URL(href, 'https://app.fluencypal.com');
    let changed = false;
    for (const key of AD_CLICK_KEYS) {
      const value = stored[key];
      if (value && !url.searchParams.get(key)) {
        url.searchParams.set(key, value);
        changed = true;
      }
    }
    return changed ? url.toString() : null;
  } catch {
    return null;
  }
};
