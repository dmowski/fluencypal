import { Button, Stack, Typography } from '@mui/material';

import { I18n } from '@lingui/core';

import { buttonStyle } from '../landingSettings';

export const SCENARIO_PLAY_CTA_ID = 'scenario-play-cta';
export const SCENARIO_HERO_CTA_ID = 'scenario-hero-cta';
export const SCENARIO_FOOTER_CTA_ID = 'scenario-footer-cta';

interface ScenarioPlayCtaProps {
  i18n: I18n;
  href: string;
  shortTitle: string;
  openingLine?: string;
}

export const ScenarioPlayCta = ({ i18n, href, shortTitle, openingLine }: ScenarioPlayCtaProps) => {
  return (
    <Stack
      sx={{
        width: '100%',
        maxWidth: '800px',
        gap: '12px',
        padding: '24px',
        borderRadius: '16px',
        backgroundColor: 'rgba(43, 35, 88, 0.06)',
        border: '1px solid rgba(43, 35, 88, 0.15)',
      }}
    >
      <Typography
        sx={{
          color: '#222',
          fontWeight: 600,
          fontSize: '1.15rem',
        }}
      >
        {i18n._('Ready to play?')}
      </Typography>
      <Typography sx={{ color: '#444' }}>
        {openingLine ||
          i18n._('Practice this conversation out loud with AI. You can start in a few seconds.')}
      </Typography>
      <Button
        href={href}
        id={SCENARIO_PLAY_CTA_ID}
        data-analytics={SCENARIO_PLAY_CTA_ID}
        variant="contained"
        sx={{
          ...buttonStyle,
          alignSelf: 'flex-start',
          height: '3rem',
        }}
      >
        {i18n._('Start')} "{shortTitle}"
      </Button>
    </Stack>
  );
};
