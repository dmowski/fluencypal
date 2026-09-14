import { isRecoverableTtsFormatError } from './isRecoverableTtsFormatError';

describe('isRecoverableTtsFormatError', () => {
  it('treats first-play SRC_NOT_SUPPORTED as a cache retry, not a Sentry issue', () => {
    expect(
      isRecoverableTtsFormatError({
        url: '/api/ttsStream?cache=true&regenerateCache=false',
        mediaErrorCode: 4,
        mediaErrorLabel: 'MEDIA_ERR_SRC_NOT_SUPPORTED',
        playErrorName: 'NotSupportedError',
        playErrorMessage: 'Failed to load because no supported source was found.',
      }),
    ).toBe(true);
  });

  it('reports the same format error after regenerateCache already ran', () => {
    expect(
      isRecoverableTtsFormatError({
        url: '/api/ttsStream?cache=true&regenerateCache=true',
        mediaErrorCode: 4,
        mediaErrorLabel: 'MEDIA_ERR_SRC_NOT_SUPPORTED',
      }),
    ).toBe(false);
  });

  it('reports format errors when there is no cached MP3 to regenerate', () => {
    expect(
      isRecoverableTtsFormatError({
        url: '/api/ttsStream?cache=false&regenerateCache=false',
        mediaErrorCode: 4,
        mediaErrorLabel: 'MEDIA_ERR_SRC_NOT_SUPPORTED',
      }),
    ).toBe(false);
  });
});
