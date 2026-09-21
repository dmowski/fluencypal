import { isUserGesturePlayError } from './isUserGesturePlayError';

describe('isUserGesturePlayError', () => {
  it('treats NotAllowedError as a play-policy failure, not a broken stream', () => {
    expect(
      isUserGesturePlayError({
        playErrorName: 'NotAllowedError',
        playErrorMessage: 'play() can only be initiated by a user gesture.',
      }),
    ).toBe(true);
  });

  it('treats Chrome autoplay blocks that omit NotAllowedError in the name', () => {
    expect(
      isUserGesturePlayError({
        playErrorName: 'AbortError',
        playErrorMessage: "play() failed because the user didn't interact with the document first.",
      }),
    ).toBe(true);
  });

  it('does not swallow format or network playback errors', () => {
    expect(
      isUserGesturePlayError({
        playErrorName: 'NotSupportedError',
        playErrorMessage: 'Failed to load because no supported source was found.',
      }),
    ).toBe(false);
  });
});
