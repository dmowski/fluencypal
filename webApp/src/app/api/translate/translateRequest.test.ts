import { translateBatchRequest, translateRequest } from './translateRequest';
import { TranslateBatchResponse, TranslateRequest, TranslateResponse } from './types';

describe('translateRequest', () => {
  const request: TranslateRequest = {
    text: 'hello',
    sourceLanguage: 'en',
    targetLanguage: 'es',
  };
  const success: TranslateResponse = {
    originalText: 'hello',
    translatedText: 'hola',
    sourceLanguage: 'en',
    targetLanguage: 'es',
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('retries a 500 and returns the later success', async () => {
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(new Response('nope', { status: 500 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(success), { status: 200 }));

    await expect(translateRequest(request, { sleep: async () => undefined })).resolves.toEqual(
      success,
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('retries a dropped connection then succeeds', async () => {
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(new Response(JSON.stringify(success), { status: 200 }));

    await expect(translateRequest(request, { sleep: async () => undefined })).resolves.toEqual(
      success,
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not retry a 400', async () => {
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(new Response('bad', { status: 400 }));

    await expect(translateRequest(request, { sleep: async () => undefined })).rejects.toThrow(
      'Translation failed',
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('translateBatchRequest', () => {
  it('posts to the batch path without trailing spaces', async () => {
    const success: TranslateBatchResponse = {
      originalTexts: ['hello'],
      translatedTexts: ['hola'],
      sourceLanguage: 'en',
      targetLanguage: 'es',
    };
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify(success), { status: 200 }));

    await expect(
      translateBatchRequest({
        texts: ['hello'],
        sourceLanguage: 'en',
        targetLanguage: 'es',
      }),
    ).resolves.toEqual(success);

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/translate/batch',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
