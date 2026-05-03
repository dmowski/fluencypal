import { ConvertDocToTextResponse } from './types';

export interface ConvertDocToTextRequest {
  textPreview: string;
}

export const sendConvertDocToTextRequest = async (
  data: ConvertDocToTextRequest,
): Promise<ConvertDocToTextResponse> => {
  try {
    const response = await fetch('/api/convertDocToText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ textPreview: data.textPreview }),
    });

    let result: ConvertDocToTextResponse | null = null;

    try {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        result = (await response.json()) as ConvertDocToTextResponse;
      }
    } catch {
      // Non-JSON response fallback is handled below.
    }

    if (!response.ok) {
      return {
        error: result?.error || 'Failed to extract book metadata.',
      };
    }

    if (result) {
      return result;
    }

    return {
      error: 'Received unexpected response from metadata service.',
    };
  } catch {
    return {
      error: 'Failed to extract book metadata.',
    };
  }
};
