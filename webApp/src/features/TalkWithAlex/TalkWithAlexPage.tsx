'use client';

import { Stack } from '@mui/material';
import { SupportedLanguage } from '@/features/Lang/lang';
import { TalkWithAlexAuthWall } from './TalkWithAlexAuthWall';
import { TalkWithAlexRequest } from './TalkWithAlexRequest';

export const TalkWithAlexPage = ({ lang }: { lang: SupportedLanguage }) => {
  return (
    <Stack
      component="main"
      data-testid="talk-with-alex-page"
      sx={{ width: '100%', alignItems: 'center', padding: '10px 0 40px' }}
    >
      <Stack sx={{ width: '100%', maxWidth: '600px' }}>
        <TalkWithAlexAuthWall>
          <TalkWithAlexRequest lang={lang} />
        </TalkWithAlexAuthWall>
      </Stack>
    </Stack>
  );
};
