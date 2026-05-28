import { GetNewsByIdRequest, GetNewsByIdResponse } from '../backend/types';

export const getNewsByIdRequest = async (
  request: GetNewsByIdRequest,
  token: string | null,
): Promise<GetNewsByIdResponse> => {
  const response = await fetch('/api/news/getNewsById', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`getNewsById failed: ${response.status}`);
  }

  return (await response.json()) as GetNewsByIdResponse;
};
