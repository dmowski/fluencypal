/**
 * Teacher cards mount several autoplaying WebM clips inside a tappable control.
 * iOS 17.4+ reports WebM as playable, including the Twitter/X in-app browser on
 * iPhone, and tapping that card crashes the host webview. Still photos avoid it.
 */
export const shouldForceTeacherCardPhoto = ({
  userAgent,
  maxTouchPoints = 0,
  platform = '',
}: {
  userAgent: string;
  maxTouchPoints?: number;
  platform?: string;
}): boolean => {
  if (/iPhone|iPad|iPod/i.test(userAgent)) return true;
  if (/twitter/i.test(userAgent)) return true;
  return platform === 'MacIntel' && maxTouchPoints > 1;
};
