/** Shared visual tokens for Voice Chat surfaces. */
export const voiceChatUi = {
  surfaceSubtle: 'rgba(255,255,255,0.04)',
  surfaceActive: 'rgba(37,138,220,0.1)',
  borderSubtle: 'rgba(255,255,255,0.1)',
  borderThread: 'rgba(255,255,255,0.18)',
  borderUnread: 'rgba(255,193,77,0.5)',
  textMuted: 'rgba(255,255,255,0.5)',
  textSecondary: 'rgba(255,255,255,0.72)',
  accent: '#58a6ff',
  success: 'rgba(72,187,120,0.9)',
  progressTrack: 'rgba(255,255,255,0.08)',
  progressBar: '#58a6ff',
  calloutBorder: 'rgba(255,255,255,0.12)',
  /** Warm dark tones that blend with the orange preview art. */
  dashboardCardBg: 'rgba(32, 24, 18, 0.92)',
  dashboardPanelBg: 'rgba(12, 10, 8, 0.55)',
  dashboardItemsBg: 'rgba(18, 14, 10, 0.75)',
  messageAvatarSize: '24px',
  messageAvatarColumnWidth: 28,
  messagePlayButtonSize: 36,
  pendingAvatarSize: '28px',
} as const;

export const formatVoiceDuration = (seconds: number): string => {
  const total = Math.max(0, Math.floor(seconds));
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m > 0) {
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
  return `${s}s`;
};
