import { Typography } from '@mui/material';
import {
  bookLandingAccentColor,
  bookLandingMaxWidth,
  bookLandingTextColor,
} from '../landingSettings';

export const PageLabel = ({ children }: { children: React.ReactNode }) => (
  <Typography
    component="span"
    sx={{
      fontSize: '0.85rem',
      fontWeight: 700,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: bookLandingAccentColor,
    }}
  >
    {children}
  </Typography>
);

export const H1 = ({ children }: { children: React.ReactNode }) => (
  <Typography
    component="h1"
    variant="h2"
    sx={{
      fontWeight: 850,
      lineHeight: 1.05,
      color: bookLandingTextColor,
      maxWidth: '900px',
      textAlign: 'center',
      '@media (max-width: 600px)': {
        fontSize: '2.2rem',
      },
    }}
  >
    {children}
  </Typography>
);

export const H2 = ({ children }: { children: React.ReactNode }) => (
  <Typography
    component="h2"
    variant="h3"
    sx={{
      fontWeight: 800,
      lineHeight: 1.15,
      color: bookLandingTextColor,
      '@media (max-width: 600px)': {
        fontSize: '1.8rem',
      },
    }}
  >
    {children}
  </Typography>
);

export const SubTitle = ({ children }: { children: React.ReactNode }) => (
  <Typography
    component="p"
    sx={{
      fontSize: '1.2rem',
      lineHeight: 1.6,
      color: 'rgba(26, 18, 8, 0.78)',
      maxWidth: bookLandingMaxWidth,
    }}
  >
    {children}
  </Typography>
);

export const BodyText = ({ children }: { children: React.ReactNode }) => (
  <Typography
    component="p"
    sx={{
      fontSize: '1rem',
      lineHeight: 1.7,
      color: 'rgba(26, 18, 8, 0.82)',
    }}
  >
    {children}
  </Typography>
);
