import { ConvertDocToTextResponse } from './types';

export interface ConvertDocToTextRequest {
  file: File;
}

export const sendConvertDocToTextRequest = async (
  data: ConvertDocToTextRequest,
): Promise<ConvertDocToTextResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', data.file);

    const response = await fetch('/api/convertDocToText', {
      method: 'POST',
      body: formData,
    });

    let result: ConvertDocToTextResponse | null = null;
    let rawResponseText = '';

    try {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        result = (await response.json()) as ConvertDocToTextResponse;
      } else {
        rawResponseText = await response.text();
      }
    } catch {
      // Some platform errors return non-JSON payloads.
    }

    if (!response.ok) {
      const isPayloadTooLarge =
        response.status === 413 ||
        /FUNCTION_PAYLOAD_TOO_LARGE|Request Entity Too Large/i.test(rawResponseText);

      if (isPayloadTooLarge) {
        return {
          markdown: result?.markdown,
          error:
            'EPUB file is too large for this deployment limit. Please use a file smaller than 4MB.',
        };
      }

      return {
        markdown: result?.markdown,
        error: result?.error || 'Failed to convert EPUB.',
      };
    }

    if (result) {
      return result;
    }

    return {
      error: 'Received unexpected response from convert service.',
    };
  } catch {
    return {
      error: 'Failed to convert EPUB.',
    };
  }
};
