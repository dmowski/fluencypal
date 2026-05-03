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

    const result = (await response.json()) as ConvertDocToTextResponse;
    if (!response.ok) {
      return {
        markdown: result.markdown,
        error: result.error || 'Failed to convert EPUB.',
      };
    }

    return result;
  } catch {
    return {
      error: 'Failed to convert EPUB.',
    };
  }
};
