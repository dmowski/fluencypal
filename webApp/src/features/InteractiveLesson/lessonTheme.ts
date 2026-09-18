export const LESSON_THEME_VARS = {
  '--page-bg': '#343438',
  '--text-primary-dark': '#F4F4F6',
  '--text-secondary-dark': '#C7C7CD',
  '--card-bg': '#F5F7F8',
  '--card-text': '#1D1E22',
  '--card-text-secondary': '#555860',
  '--feedback-bg': '#F1F4F3',
  '--accent': '#2DAEF3',
} as const;

export const LESSON_DIVIDER_COLOR = 'rgba(255, 255, 255, 0.15)';

export const lessonThemeSx = {
  ...LESSON_THEME_VARS,
  backgroundColor: 'var(--page-bg)',
  color: 'var(--text-primary-dark)',
} as const;

export const lessonAccentButtonSx = {
  backgroundColor: 'var(--accent)',
  color: 'var(--text-primary-dark)',
  '&:hover': {
    backgroundColor: 'color-mix(in srgb, var(--accent) 88%, #000)',
  },
} as const;
