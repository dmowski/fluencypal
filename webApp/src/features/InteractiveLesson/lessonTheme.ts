export const lessonColor = {
  // Main surfaces
  bg: '#343438',
  bgElevated: '#3A3A3F',

  // Text on dark background
  textPrimary: '#F4F4F6',
  textSecondary: '#C9CBD1',
  textMuted: '#A3A6AE',

  // Structure
  divider: 'rgba(255, 255, 255, 0.12)',

  // Light cards
  cardBg: '#F5F6F7',
  cardBgSecondary: '#F0F2F2',
  cardText: '#1F2024',
  cardTextSecondary: '#5C6068',
  cardBorder: '#D8DBDF',

  // Accent
  accent: '#2AA6E8',
  accentHover: '#218FC9',
  accentSoft: 'rgba(42, 166, 232, 0.10)',
  accentPulse: 'rgba(42, 166, 232, 0.55)',
  accentPulseEnd: 'rgba(42, 166, 232, 0)',

  // Neutral interactive controls
  controlNeutral: '#B7BAC2',
  controlNeutralHover: '#E3E5E9',
  controlNeutralDark: '#747983',
  controlNeutralOnLight: '#626770',
  controlNeutralOnLightHover: '#2F3339',

  // Semantic
  dangerMuted: '#B0B3BA',
  dangerHover: '#E56B64',
  recording: '#EF5350',
  recordingHover: '#E04845',
  recordingBorder: 'rgba(239, 83, 80, 0.65)',
  recordingSoft: 'rgba(239, 83, 80, 0.10)',
  recordingWave: '#D9DCE2',
  recordingCancel: '#9FA3AB',
  recordingCancelHover: '#EF5350',
  warning: '#F09A91',

  // Disabled
  disabledBg: '#505158',
  disabledText: '#8D9098',

  // Contrast text
  onAccent: '#FFFFFF',

  // Dashboard
  dashboardDone: 'rgba(6, 21, 77, 0.3)',
  dashboardIdle: 'rgba(18, 32, 54, 0.3)',
  dashboardItems: 'rgba(0, 0, 0, 0.20)',
} as const;

export const lessonSx = {
  page: {
    backgroundColor: lessonColor.bg,
    color: lessonColor.textPrimary,
  },

  textPrimary: {
    color: lessonColor.textPrimary,
  },

  textSecondary: {
    color: lessonColor.textSecondary,
  },

  textMuted: {
    color: lessonColor.textMuted,
  },

  cardText: {
    color: lessonColor.cardText,
  },

  cardCaption: {
    color: lessonColor.cardTextSecondary,
  },

  elevated: {
    backgroundColor: lessonColor.bgElevated,
  },

  divider: {
    borderColor: lessonColor.divider,
  },

  dividerTop: {
    borderTop: `1px solid ${lessonColor.divider}`,
  },

  title: {
    color: lessonColor.textPrimary,
    '& p': {
      color: lessonColor.textSecondary,
    },
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

  accentSoft: {
    backgroundColor: lessonColor.accentSoft,
  },

  progressBar: {
    backgroundColor: lessonColor.accentSoft,
    '& .MuiLinearProgress-bar': {
      backgroundColor: lessonColor.accent,
    },
  },

  recordingVisualizer: {
    backgroundColor: 'transparent',
    border: `1px solid ${lessonColor.recordingBorder}`,
    color: lessonColor.recordingWave,
  },

  warningText: {
    color: lessonColor.warning,
  },

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
  borderColor: lessonColor.controlNeutralDark,
  backgroundColor: 'transparent',

  '&:hover': {
    color: lessonColor.accent,
    borderColor: lessonColor.accent,
    backgroundColor: lessonColor.accentSoft,
  },

  '&.Mui-disabled': {
    color: lessonColor.disabledText,
    borderColor: lessonColor.disabledBg,
  },
} as const;

export const lessonGhostButtonSx = {
  color: lessonColor.controlNeutral,

  '&:hover': {
    color: lessonColor.textPrimary,
    backgroundColor: 'transparent',
  },

  '&.Mui-disabled': {
    color: lessonColor.disabledText,
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

export const lessonRecordingButtonSx = {
  backgroundColor: lessonColor.recording,
  color: lessonColor.onAccent,

  '&:hover': {
    backgroundColor: lessonColor.recordingHover,
  },
} as const;

export const lessonRecordingVisualizerSx = {
  backgroundColor: 'transparent',
  border: `1px solid ${lessonColor.recordingBorder}`,
  color: lessonColor.recordingWave,
} as const;

export const lessonRecordingCancelSx = {
  color: lessonColor.recordingCancel,

  '&:hover': {
    color: lessonColor.recordingCancelHover,
    backgroundColor: 'transparent',
  },
} as const;

export const lessonPlayIconColor = (
  isPlaying: boolean,
  surface: 'dark' | 'light' = 'dark',
  isHover = false,
) => {
  if (isPlaying) return isHover ? lessonColor.accentHover : lessonColor.accent;
  if (surface === 'light') {
    return isHover ? lessonColor.controlNeutralOnLightHover : lessonColor.controlNeutralOnLight;
  }
  return isHover ? lessonColor.textPrimary : lessonColor.controlNeutral;
};

export const lessonPlaySx = (isPlaying: boolean) => ({
  color: isPlaying ? lessonColor.accent : lessonColor.controlNeutral,

  '&:hover': {
    color: isPlaying ? lessonColor.accentHover : lessonColor.textPrimary,
  },

  '@keyframes lessonPlayButtonPulse': {
    '0%': {
      boxShadow: `0 0 0 0 ${lessonColor.accentPulse}`,
    },
    '70%': {
      boxShadow: `0 0 0 10px ${lessonColor.accentPulseEnd}`,
    },
    '100%': {
      boxShadow: `0 0 0 0 ${lessonColor.accentPulseEnd}`,
    },
  },

  animation: isPlaying ? 'lessonPlayButtonPulse 1.4s ease-out infinite' : 'none',
});

export const lessonCardPlaySx = (isPlaying: boolean) => ({
  color: isPlaying ? lessonColor.accent : lessonColor.controlNeutralOnLight,

  '&:hover': {
    color: isPlaying ? lessonColor.accentHover : lessonColor.controlNeutralOnLightHover,
  },

  '@keyframes lessonPlayButtonPulse': {
    '0%': {
      boxShadow: `0 0 0 0 ${lessonColor.accentPulse}`,
    },
    '70%': {
      boxShadow: `0 0 0 10px ${lessonColor.accentPulseEnd}`,
    },
    '100%': {
      boxShadow: `0 0 0 0 ${lessonColor.accentPulseEnd}`,
    },
  },

  animation: isPlaying ? 'lessonPlayButtonPulse 1.4s ease-out infinite' : 'none',
});
