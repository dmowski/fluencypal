/**
 * HTMLAudioElement.play() rejects with NotAllowedError when the call is not
 * in a user gesture (autoplay, or play after an await). That is browser
 * policy, not a broken TTS stream (DARK-LANG-JE).
 */
export const isUserGesturePlayError = ({
  playErrorName,
  playErrorMessage,
}: {
  playErrorName?: string;
  playErrorMessage?: string;
}): boolean => {
  if (playErrorName === 'NotAllowedError') return true;
  const message = playErrorMessage ?? '';
  return /user gesture/i.test(message) || /didn't interact/i.test(message);
};
