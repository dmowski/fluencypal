'use client';

import { Button } from '@mui/material';
import { useLingui } from '@lingui/react';
import { buttonStyle } from '@/features/Landing/landingSettings';

const ctaButtonSx = {
  ...buttonStyle,
  padding: '12px 32px',
  color: '#041018',
  backgroundColor: '#7DDEAA',
  fontWeight: 800,
};

export const GroupConversationJoinButton = ({ href }: { href: string }) => {
  const { i18n } = useLingui();

  return (
    <Button
      href={href}
      variant="contained"
      size="large"
      data-analytics="community-call-cta"
      data-testid="group-conversations-cta"
      sx={{ ...ctaButtonSx, marginTop: '8px' }}
    >
      {i18n._('See schedule')}
    </Button>
  );
};
