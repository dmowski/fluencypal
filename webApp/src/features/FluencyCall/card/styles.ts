export const token = {
  bg: '#16181F',
  soft: '#20232D',
  text: '#EDF0F8',
  muted: '#A8AFC0',
  line: '#323644',
  accent: '#C4BAFF',
  accentText: '#242035',
  danger: '#ffb4b4',
  disabled: '#9098ab',
};

export const narrow = '@media (max-width: 440px)';

export const textButtonSx = {
  backgroundColor: 'transparent',
  padding: '16px 15px',
  minHeight: 40,
  minWidth: 0,
  fontSize: '13px',
  fontWeight: 600,
  letterSpacing: 'normal',
  textTransform: 'none',
  whiteSpace: 'nowrap',
  '&:hover': { backgroundColor: 'rgba(41, 182, 246, 0.12)' },
  '&.Mui-disabled': { color: token.disabled },
};

export const primaryButtonSx = {
  borderRadius: '10px',
  padding: '12px 18px',
  minHeight: 44,
  fontSize: '15px',
  fontWeight: 600,
  letterSpacing: 'normal',
  textTransform: 'none',
  '& svg': { color: 'inherit', stroke: 'currentColor' },
  [narrow]: { width: '100%' },
};
