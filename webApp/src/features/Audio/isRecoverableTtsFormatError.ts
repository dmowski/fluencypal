export const isRecoverableTtsFormatError = ({
  url,
  mediaErrorCode,
  mediaErrorLabel,
  playErrorName,
  playErrorMessage,
}: {
  url: string;
  mediaErrorCode?: number | null;
  mediaErrorLabel?: string | null;
  playErrorName?: string;
  playErrorMessage?: string;
}): boolean => {
  if (!/[?&]cache=true(?:&|$)/.test(url)) return false;
  if (/[?&]regenerateCache=true(?:&|$)/.test(url)) return false;
  const text = `${playErrorName ?? ''} ${playErrorMessage ?? ''} ${mediaErrorLabel ?? ''}`;
  return (
    mediaErrorCode === 4 ||
    mediaErrorLabel === 'MEDIA_ERR_SRC_NOT_SUPPORTED' ||
    playErrorName === 'NotSupportedError' ||
    text.includes('MEDIA_ERR_SRC_NOT_SUPPORTED') ||
    text.includes('no supported source')
  );
};

const HAVE_NOTHING = 0;
const NETWORK_NO_SOURCE = 3;
const MEDIA_ERR_SRC_NOT_SUPPORTED = 4;

/**
 * WebKit labels a media fetch that never returned bytes as
 * MEDIA_ERR_SRC_NOT_SUPPORTED. That is a failed load, not a bad MP3.
 */
export const isUnloadedUnsupportedSource = ({
  mediaErrorCode,
  readyState,
  networkState,
}: {
  mediaErrorCode?: number | null;
  readyState: number;
  networkState: number;
}): boolean =>
  mediaErrorCode === MEDIA_ERR_SRC_NOT_SUPPORTED &&
  readyState === HAVE_NOTHING &&
  networkState === NETWORK_NO_SOURCE;
