'use client';

import { useId, useState } from 'react';
import { Box, Stack } from '@mui/material';
import { FluencyCallCardHeader } from './card/FluencyCallCardHeader';
import { FluencyCallChatPanel } from './card/FluencyCallChatPanel';
import { FluencyCallRequestSection } from './card/FluencyCallRequestSection';
import { narrow, token } from './card/styles';
import { FluencyCallCardViewProps } from './card/types';
import { MutedPreviewVideo } from '../uiKit/Video/MutedPreviewVideo';

export {
  FLUENCY_CALL_CHAT_PAGE,
  FLUENCY_CALL_WELCOME_VIDEO_SRC,
  type FluencyCallCardCall,
  type FluencyCallCardViewProps,
} from './card/types';

const stackColumns = {
  gridTemplateColumns: '1fr',
  gridTemplateAreas: '"video" "request"',
  alignItems: 'center',
  gap: '20px',
  padding: '20px 0',
};

export const FluencyCallCardView = ({
  messages,
  onSendMessage,
  canJoin,
  paidNotice,
  initialChatExpanded = false,
  welcomeVideoSrc,
}: FluencyCallCardViewProps) => {
  const uid = useId();
  const [error, setError] = useState('');

  return (
    <Box
      component="section"
      id="fluency-call"
      data-testid="fluency-call-card"
      aria-labelledby={`${uid}-title`}
      sx={{
        containerType: 'inline-size',
        containerName: 'fluency-call-card',
        width: '100%',
        overflow: 'hidden',
        color: token.text,
        backgroundColor: token.bg,
        border: `1px solid rgba(255, 255, 255, 0.08)`,
        borderRadius: '16px',
        font: 'inherit',
        '& :focus-visible': {
          outline: `2px solid ${token.accent}`,
          outlineOffset: '3px',
        },
      }}
    >
      <Stack sx={{ padding: '24px 20px 20px 20px', gap: 0, [narrow]: { padding: '20px' } }}>
        <FluencyCallCardHeader
          titleId={`${uid}-title`}
          canJoin={canJoin}
          paidNotice={paidNotice}
        />
        <Stack
          sx={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gridTemplateAreas: '"video request"',
            alignItems: 'center',
            gap: '30px',
            padding: '20px 0 0px 0',
            '@media (max-width: 600px)': stackColumns,
            '@container fluency-call-card (max-width: 560px)': stackColumns,
          }}
        >
          <Stack
            sx={{
              gridArea: 'video',
              alignItems: 'flex-start',
              padding: '10px 10px 0px 0px',
              width: '100%',
            }}
          >
            <MutedPreviewVideo src={welcomeVideoSrc} muteSize="150px" playSize="280px" />
          </Stack>
          <Stack sx={{ gridArea: 'request', minWidth: 0 }}>
            <FluencyCallRequestSection />
          </Stack>
        </Stack>
      </Stack>

      <FluencyCallChatPanel
        messages={messages}
        initialExpanded={initialChatExpanded}
        alert={error}
        onSendMessage={onSendMessage}
        onError={setError}
      />
    </Box>
  );
};
