import { Stack, Typography } from '@mui/material';
import { bookLandingFaqItems } from '../landingData';
import { bookLandingBgColor, bookLandingMaxWidth, bookLandingTextColor } from '../landingSettings';
import { H2, SubTitle } from './Typography';

export const FaqSection = () => {
  return (
    <Stack
      id="faq"
      component="section"
      sx={{
        width: '100%',
        alignItems: 'center',
        padding: { xs: '64px 20px', md: '96px 20px' },
        backgroundColor: bookLandingBgColor,
      }}
    >
      <Stack sx={{ maxWidth: bookLandingMaxWidth, width: '100%', gap: '36px' }}>
        <Stack sx={{ gap: '12px', maxWidth: '760px' }}>
          <H2>Frequently asked questions</H2>
          <SubTitle>Common questions about FluencyPal Books, file formats, and how it fits with FluencyPal speaking practice.</SubTitle>
        </Stack>
        <Stack component="dl" sx={{ gap: '24px', margin: 0 }}>
          {bookLandingFaqItems.map((item) => (
            <Stack
              key={item.question}
              component="div"
              sx={{
                gap: '10px',
                padding: '24px',
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.35)',
                border: '1px solid rgba(44, 24, 16, 0.08)',
              }}
            >
              <Typography
                component="dt"
                sx={{
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  color: bookLandingTextColor,
                  margin: 0,
                }}
              >
                {item.question}
              </Typography>
              <Typography
                component="dd"
                sx={{
                  fontSize: '1rem',
                  lineHeight: 1.7,
                  color: 'rgba(26, 18, 8, 0.82)',
                  margin: 0,
                }}
              >
                {item.answer}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
};
