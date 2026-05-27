import { GetNewsFullTextRequest, GetNewsFullTextResponse } from '../types';

export const getNewsFullTextRequest = async (
  request: GetNewsFullTextRequest,
  token: string | null,
): Promise<GetNewsFullTextResponse> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch('/api/news/getNewsFullText', {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`getNewsFullText failed: ${response.status}`);
  }

  return (await response.json()) as GetNewsFullTextResponse;
};
