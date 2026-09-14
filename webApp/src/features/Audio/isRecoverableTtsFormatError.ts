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
