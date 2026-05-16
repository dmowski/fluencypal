import { GetTodayNewsRequest, GetTodayNewsResponse } from '../types';

export const getTodayNewsRequest = async (
  request: GetTodayNewsRequest,
  token: string | null,
): Promise<GetTodayNewsResponse> => {
  const response = await fetch('/api/news/getTodayNews', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`getTodayNews failed: ${response.status}`);
  }

  return (await response.json()) as GetTodayNewsResponse;
};
