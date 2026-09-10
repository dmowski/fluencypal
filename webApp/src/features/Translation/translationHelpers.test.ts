import { getTranslation } from './translationHelpers';

describe('getTranslation', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns empty string when the translate API keeps failing', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(new Response('nope', { status: 500 }));

    await expect(
      getTranslation({
        text: 'hello',
        sourceLanguage: 'en',
        targetLanguage: 'es',
      }),
    ).resolves.toBe('');
  });
});
