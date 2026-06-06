import { DescribeImageRequest, DescribeImageResponse } from '../backend/types';

export const describeImageRequest = async (
  request: DescribeImageRequest,
  token: string | null,
): Promise<DescribeImageResponse> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch('/api/quiz/describeImage', {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`describeImage failed: ${response.status}`);
  }

  return (await response.json()) as DescribeImageResponse;
};
