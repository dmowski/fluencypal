'use client';

import { Link, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { getLandingUrlStart } from '@/features/Lang/getUrlStart';

export const VoiceNotice = ({ kind }: { kind: 'message' | 'intro' }) => {
  const { i18n } = useLingui();
  return (
    <Typography sx={{ fontSize: '13px', opacity: 0.72, maxWidth: 560 }}>
      {kind === 'message'
        ? i18n._(
            'People in the room can hear this. We keep the recording for 7 days. OpenAI writes down what you said.',
          )
        : i18n._(
            'Reviewers hear this introduction. People in the room can read it afterwards. We keep the recording until you delete your voice data. OpenAI writes down what you said.',
          )}{' '}
      <Link href={`${getLandingUrlStart('en')}privacy`} target="_blank" rel="noreferrer">
        {i18n._('Privacy policy')}
      </Link>
    </Typography>
  );
};
