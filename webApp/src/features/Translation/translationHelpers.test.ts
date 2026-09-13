import { getTranslation } from './translationHelpers';
import * as Sentry from '@sentry/nextjs';

jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(() => ''),
}));

describe('getTranslation', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.mocked(Sentry.captureException).mockClear();
  });

  it('returns the original text when source and target are the same language', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch');

    await expect(
      getTranslation({
        text: 'hello',
        sourceLanguage: 'en',
        targetLanguage: 'en',
      }),
    ).resolves.toBe('hello');
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(Sentry.captureException).not.toHaveBeenCalled();
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
    expect(Sentry.captureException).toHaveBeenCalled();
  });
});
