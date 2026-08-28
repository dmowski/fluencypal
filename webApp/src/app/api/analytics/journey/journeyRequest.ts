import { JourneyRequest, JourneyResponse } from '@/features/Analytics/Custom/types';

export const loadJourneyRequest = async (request: JourneyRequest, auth: string) => {
  const response = await fetch('/api/analytics/journey', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth}`,
    },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error || 'Failed to load journey analytics');
  }
  return (await response.json()) as JourneyResponse;
};
