import { ConvertDocToTextResponse } from './types';

export interface ConvertDocToTextRequest {
  textPreview: string;
}

export const sendConvertDocToTextRequest = async (
  data: ConvertDocToTextRequest,
): Promise<ConvertDocToTextResponse> => {
  try {
    console.log('[sendConvertDocToTextRequest] fetch starting', {
      previewLength: data.textPreview.length,
    });
    const fetchStart = Date.now();
    const response = await fetch('/api/convertDocToText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ textPreview: data.textPreview }),
    });
    console.log('[sendConvertDocToTextRequest] fetch response received', {
      durationMs: Date.now() - fetchStart,
      status: response.status,
      ok: response.ok,
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
