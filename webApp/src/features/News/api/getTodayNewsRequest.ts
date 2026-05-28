import { GetTodayNewsRequest, GetTodayNewsResponse } from '../backend/types';

export const getTodayNewsRequest = async (
  request: GetTodayNewsRequest,
  token: string | null,
): Promise<GetTodayNewsResponse> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch('/api/news/getTodayNews', {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`getTodayNews failed: ${response.status}`);
  }

  return response.json() as Promise<GetTodayNewsResponse>;
};
