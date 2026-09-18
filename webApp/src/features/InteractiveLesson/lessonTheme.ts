export const lessonColor = {
  bg: '#343438',
  bgElevated: '#3A3A3F',
  textPrimary: '#F4F4F6',
  textSecondary: '#C7C7CD',
  textMuted: '#9A9EA6',
  divider: 'rgba(255, 255, 255, 0.14)',
  cardBg: '#F5F7F8',
  cardBgSecondary: '#F1F4F3',
  cardText: '#1D1E22',
  cardTextSecondary: '#555A62',
  cardBorder: '#D9DDE1',
  accent: '#2AA6E8',
  accentHover: '#238FC9',
  accentSoft: 'rgba(42, 166, 232, 0.12)',
  accentPulse: 'rgba(42, 166, 232, 0.7)',
  accentPulseEnd: 'rgba(42, 166, 232, 0)',
  controlNeutral: '#B8BCC4',
  controlNeutralHover: '#E7E9ED',
  dangerMuted: '#A9ADB5',
  dangerHover: '#F06A61',
  disabledBg: '#55565C',
  disabledText: '#8E9198',
  onAccent: '#fff',
  recording: '#F44336',
  warning: '#ff8e86',
  dashboardDone: 'rgba(16, 92, 46, 0.72)',
  dashboardIdle: 'rgba(18, 32, 54, 0.72)',
  dashboardItems: 'rgba(0, 0, 0, 0.2)',
} as const;

export const lessonSx = {
  page: {
    backgroundColor: lessonColor.bg,
    color: lessonColor.textPrimary,
  },
  textPrimary: { color: lessonColor.textPrimary },
  textSecondary: { color: lessonColor.textSecondary },
  textMuted: { color: lessonColor.textMuted },
  cardText: { color: lessonColor.cardText },
  cardCaption: { color: lessonColor.cardTextSecondary },
  elevated: { backgroundColor: lessonColor.bgElevated },
  divider: { borderColor: lessonColor.divider },
  dividerTop: { borderTop: `1px solid ${lessonColor.divider}` },
  title: {
    color: lessonColor.textPrimary,
    '& p': { color: lessonColor.textSecondary },
  },
  answerCard: {
    backgroundColor: lessonColor.cardBg,
    borderBottom: `1px solid ${lessonColor.cardBorder}`,
    color: lessonColor.cardText,
  },
  feedbackCard: {
    backgroundColor: lessonColor.cardBgSecondary,
    color: lessonColor.cardText,
  },
  accentSoft: { backgroundColor: lessonColor.accentSoft },
  progressBar: {
    backgroundColor: lessonColor.accentSoft,
    '& .MuiLinearProgress-bar': { backgroundColor: lessonColor.accent },
  },
  recordingVisualizer: {
    boxShadow: `inset 0 0 0 1px ${lessonColor.recording}`,
  },
  warningText: { color: lessonColor.warning },
  feedbackMarkdown: {
    '& .MuiTypography-root': {
      fontSize: '18px !important',
      fontWeight: 400,
    },
  },
} as const;

export const lessonThemeSx = lessonSx.page;

export const lessonSurfaceStyle = {
  background: lessonColor.bg,
  color: lessonColor.textPrimary,
} as const;

export const lessonPrimaryButtonSx = {
  backgroundColor: lessonColor.accent,
  color: lessonColor.onAccent,
  '&:hover': {
    backgroundColor: lessonColor.accentHover,
  },
  '&.Mui-disabled': {
    backgroundColor: lessonColor.disabledBg,
    color: lessonColor.disabledText,
  },
} as const;

export const lessonRecordButtonSx = {
  color: lessonColor.controlNeutral,
  borderColor: lessonColor.controlNeutral,
  backgroundColor: 'transparent',
  '&:hover': {
    color: lessonColor.accent,
    borderColor: lessonColor.accent,
    backgroundColor: lessonColor.accentSoft,
  },
} as const;

export const lessonGhostButtonSx = {
  color: lessonColor.controlNeutral,
  '&:hover': {
    color: lessonColor.accent,
    backgroundColor: 'transparent',
  },
} as const;

export const lessonSkipButtonSx = {
  color: lessonColor.dangerMuted,
  '&:hover': {
    color: lessonColor.dangerHover,
    backgroundColor: 'transparent',
  },
  '&.Mui-disabled': {
    color: lessonColor.disabledText,
  },
} as const;

export const lessonPlaySx = (isPlaying: boolean) => ({
  color: isPlaying ? lessonColor.accent : lessonColor.controlNeutral,
  '@keyframes lessonPlayButtonPulse': {
    '0%': { boxShadow: `0 0 0 0 ${lessonColor.accentPulse}` },
    '70%': { boxShadow: `0 0 0 10px ${lessonColor.accentPulseEnd}` },
    '100%': { boxShadow: `0 0 0 0 ${lessonColor.accentPulseEnd}` },
  },
  animation: isPlaying ? 'lessonPlayButtonPulse 1.4s ease-out infinite' : 'none',
});
