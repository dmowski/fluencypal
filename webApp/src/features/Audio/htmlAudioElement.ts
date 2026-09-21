/** Tiny silent WAV so HTMLAudioElement.play() can run inside a user gesture. */
const SILENT_WAV_DATA_URI =
  'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

export const resetHtmlAudioElement = (el: HTMLAudioElement): void => {
  try {
    el.pause();
  } catch {}
  try {
    el.currentTime = 0;
  } catch {}
};

export const shouldRetryPlayOnFreshElement = (error: unknown): boolean => {
  if (!error) return false;
  const name = (error as { name?: string }).name;
  if (name === 'AbortError') return false;
  const message = error instanceof Error ? error.message : String(error);
  return (
    name === 'NotSupportedError' ||
    message.includes('MEDIA_ERR_SRC_NOT_SUPPORTED') ||
    message.includes('The operation is not supported') ||
    message.includes('no supported source')
  );
};

/**
 * Call from a click/tap before any await. Starts play() synchronously so
 * later stream playback is allowed after the gesture has ended.
 */
export const startHtmlAudioPrimeFromGesture = (el: HTMLAudioElement): Promise<void> => {
  if (typeof el.play !== 'function') return Promise.resolve();

  el.src = SILENT_WAV_DATA_URI;
  let playResult: Promise<void> | undefined;
  try {
    playResult = el.play();
  } catch {
    return Promise.resolve();
  }

  return Promise.resolve(playResult).then(
    () => {
      try {
        el.pause();
        el.currentTime = 0;
      } catch {}
      try {
        el.removeAttribute('src');
      } catch {}
    },
    () => {},
  );
};
