import { Stack } from '@mui/material';
import { bookLandingSteps } from '../landingData';
import { bookLandingAccentColor, bookLandingMaxWidth } from '../landingSettings';
import { BodyText, H2, SubTitle } from './Typography';

export const HowItWorksSection = () => {
  return (
    <Stack
      id="how-it-works"
      component="section"
      sx={{
        width: '100%',
        alignItems: 'center',
        padding: { xs: '64px 20px', md: '96px 20px' },
        backgroundColor: '#ead7b8',
      }}
    >
      <Stack sx={{ maxWidth: bookLandingMaxWidth, width: '100%', gap: '36px' }}>
        <Stack sx={{ gap: '12px', maxWidth: '760px' }}>
          <H2>How it works</H2>
          <SubTitle>From import to insight in three steps.</SubTitle>
        </Stack>
        <Stack
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
            gap: '20px',
          }}
        >
          {bookLandingSteps.map((step) => (
            <Stack
              key={step.step}
              sx={{
                gap: '12px',
                padding: '24px',
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.35)',
                border: '1px solid rgba(44, 24, 16, 0.08)',
              }}
            >
              <Stack
                sx={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '999px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  color: '#fff',
                  backgroundColor: bookLandingAccentColor,
                }}
              >
                {step.step}
              </Stack>
              <Stack component="h3" sx={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                {step.title}
              </Stack>
              <BodyText>{step.description}</BodyText>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
};
