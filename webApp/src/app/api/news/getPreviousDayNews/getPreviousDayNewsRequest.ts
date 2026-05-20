import { GetPreviousDayNewsRequest, GetPreviousDayNewsResponse } from '../types';

export const getPreviousDayNewsRequest = async (
  request: GetPreviousDayNewsRequest,
  token: string | null,
): Promise<GetPreviousDayNewsResponse> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch('/api/news/getPreviousDayNews', {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`getPreviousDayNews failed: ${response.status}`);
  }

  return (await response.json()) as GetPreviousDayNewsResponse;
};
