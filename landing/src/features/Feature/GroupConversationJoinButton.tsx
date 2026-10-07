'use client';

import { Button } from '@mui/material';
import { useLingui } from '@lingui/react';
import { buttonStyle } from '@/features/Landing/landingSettings';
import { groupCallTimeLabel, nextGroupCall } from './groupCallTimeLabel';
import { useEnglishGroupCalls } from './useEnglishGroupCalls';

const ctaButtonSx = {
  ...buttonStyle,
  padding: '12px 32px',
  color: '#041018',
  backgroundColor: '#7DDEAA',
  fontWeight: 800,
};

export const GroupConversationJoinButton = ({ href }: { href: string }) => {
  const { i18n } = useLingui();
  const { calls } = useEnglishGroupCalls();
  const next = calls ? nextGroupCall(calls) : null;
  const label = next
    ? groupCallTimeLabel(
        next.startsAtIso,
        i18n.locale || 'en',
        Intl.DateTimeFormat().resolvedOptions().timeZone,
      )
    : null;
  const title = label?.live
    ? i18n._('Join now')
    : label
      ? i18n._('Join {when}', { when: label.when })
      : i18n._('See upcoming calls');

  return (
    <Button
      href={href}
      variant="contained"
      size="large"
      data-analytics="community-call-cta"
      data-testid="group-conversations-cta"
      sx={{ ...ctaButtonSx, marginTop: '8px' }}
    >
      {title}
    </Button>
  );
};
