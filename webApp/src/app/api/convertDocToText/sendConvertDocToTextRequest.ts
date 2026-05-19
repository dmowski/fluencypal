import { ConvertDocToTextResponse } from './types';

export interface ConvertDocToTextRequest {
  textPreview: string;
}

const AI_METADATA_TIMEOUT_MS = 15_000;

export const sendConvertDocToTextRequest = async (
  data: ConvertDocToTextRequest,
): Promise<ConvertDocToTextResponse> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_METADATA_TIMEOUT_MS);

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
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
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
        console.log('[sendConvertDocToTextRequest] result received', result);
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
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === 'AbortError') {
      console.warn(
        '[sendConvertDocToTextRequest] request timed out, falling back to epub metadata',
        {
          timeoutMs: AI_METADATA_TIMEOUT_MS,
        },
      );
      return { error: 'AI metadata request timed out.' };
    }
    return {
      error: 'Failed to extract book metadata.',
    };
  }
};
