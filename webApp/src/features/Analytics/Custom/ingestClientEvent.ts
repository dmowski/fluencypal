import { AnalyticsClientEvent, IngestEventRequest, IngestEventResponse } from './types';

export const ingestClientEvent = async (
  visitorId: string,
  event: AnalyticsClientEvent,
): Promise<void> => {
  const body: IngestEventRequest = { visitorId, event };
  try {
    const response = await fetch('/api/analytics/ingest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Fp-Analytics': 'tracker',
      },
      body: JSON.stringify(body),
      keepalive: true,
    });
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as IngestEventResponse | null;
      console.warn('Custom analytics ingest failed', payload?.error || response.status);
    }
  } catch (error) {
    // Offline / tab killed / ad-block: never surface as an unhandled rejection (DARK-LANG-HY).
    console.warn('Custom analytics ingest failed', error);
  }
};
