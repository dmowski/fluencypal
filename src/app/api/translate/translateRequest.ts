import { TranslateRequest, TranslateResponse } from './types';

export const translateRequest = async (request: TranslateRequest): Promise<TranslateResponse> => {
  const response = await fetch('/api/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error('Translation failed');
  }

  const data = (await response.json()) as TranslateResponse;
  return data;
};
