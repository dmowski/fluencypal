import { LoadRecentUsersResponse } from './types';

export const loadRecentUsersRequest = async (auth: string): Promise<LoadRecentUsersResponse> => {
  const response = await fetch('/api/loadRecentUsers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth}`,
    },
    body: JSON.stringify({}),
  });
  const data = (await response.json()) as LoadRecentUsersResponse;
  return data;
};
