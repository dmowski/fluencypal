export type AliasCtaPlacement =
  | 'hero'
  | 'steps'
  | 'final'
  | 'sticky'
  | 'result_preview';

declare global {
  interface Window {
    datafast?: (eventName: string, properties?: Record<string, string>) => void;
  }
}

export function trackAliasEvent(
  eventName: string,
  properties?: Record<string, string>,
): void {
  if (typeof window === 'undefined') return;
  const tracker = window.datafast;
  if (typeof tracker !== 'function') return;
  try {
    tracker(eventName, properties);
  } catch {
    // Ignore analytics failures in non-production environments.
  }
}

export function trackAliasCtaClicked(placement: AliasCtaPlacement): void {
  trackAliasEvent('alias_cta_clicked', { placement });
}
