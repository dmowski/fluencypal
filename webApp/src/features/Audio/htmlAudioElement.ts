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
