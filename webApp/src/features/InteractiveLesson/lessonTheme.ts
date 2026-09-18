export const LESSON_THEME_VARS = {
  '--bg': '#343438',
  '--bg-elevated': '#3A3A3F',
  '--text-primary': '#F4F4F6',
  '--text-secondary': '#C7C7CD',
  '--text-muted': '#9A9EA6',
  '--divider': 'rgba(255, 255, 255, 0.14)',
  '--card-bg': '#F5F7F8',
  '--card-bg-secondary': '#F1F4F3',
  '--card-text': '#1D1E22',
  '--card-text-secondary': '#555A62',
  '--card-border': '#D9DDE1',
  '--accent': '#2AA6E8',
  '--accent-hover': '#238FC9',
  '--accent-soft': 'rgba(42, 166, 232, 0.12)',
  '--control-neutral': '#B8BCC4',
  '--control-neutral-hover': '#E7E9ED',
  '--danger-muted': '#A9ADB5',
  '--danger-hover': '#F06A61',
  '--disabled-bg': '#55565C',
  '--disabled-text': '#8E9198',
} as const;

export const LESSON_DIVIDER_COLOR = 'var(--divider)';

export const lessonThemeSx = {
  ...LESSON_THEME_VARS,
  backgroundColor: 'var(--bg)',
  color: 'var(--text-primary)',
} as const;

export const lessonPrimaryButtonSx = {
  backgroundColor: 'var(--accent)',
  color: '#fff',
  '&:hover': {
    backgroundColor: 'var(--accent-hover)',
  },
  '&.Mui-disabled': {
    backgroundColor: 'var(--disabled-bg)',
    color: 'var(--disabled-text)',
  },
} as const;

export const lessonRecordButtonSx = {
  color: 'var(--control-neutral)',
  borderColor: 'var(--control-neutral)',
  backgroundColor: 'transparent',
  '&:hover': {
    color: 'var(--accent)',
    borderColor: 'var(--accent)',
    backgroundColor: 'var(--accent-soft)',
  },
} as const;

export const lessonGhostButtonSx = {
  color: 'var(--control-neutral)',
  '&:hover': {
    color: 'var(--accent)',
    backgroundColor: 'transparent',
  },
} as const;

export const lessonSkipButtonSx = {
  color: 'var(--danger-muted)',
  '&:hover': {
    color: 'var(--danger-hover)',
    backgroundColor: 'transparent',
  },
  '&.Mui-disabled': {
    color: 'var(--disabled-text)',
  },
} as const;
