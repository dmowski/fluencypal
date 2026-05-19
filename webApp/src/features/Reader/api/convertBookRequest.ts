export interface ConvertBookResponse {
  epubBlobPath: string;
}

export const sendConvertBookRequest = async ({
  storagePath,
  fileName,
  bookId,
  getToken,
}: {
  storagePath: string;
  fileName: string;
  bookId: string;
  getToken: () => Promise<string>;
}): Promise<ConvertBookResponse> => {
  const token = await getToken();
  const response = await fetch('/api/reader/convert', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ storagePath, fileName, bookId }),
  });

  if (!response.ok) {
    let message = `Conversion failed (${response.status})`;
    try {
      const json = (await response.json()) as { error?: string };
      if (json.error) message = json.error;
    } catch {
      // ignore parse error
    }
    throw new Error(message);
  }

  return response.json() as Promise<ConvertBookResponse>;
};
