import { AdminStatsRequest, AdminStatsResponse } from './types';

export const loadStatsRequest = async (request: AdminStatsRequest, auth: string) => {
  const response = await fetch('/api/loadStats', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth}`,
    },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    throw new Error(`Failed to load users (${response.status})`);
  }
  const data = (await response.json()) as AdminStatsResponse;
  return data;
};
