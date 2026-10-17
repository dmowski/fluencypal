'use client';

import { useId } from 'react';
import { Box, Stack } from '@mui/material';
import { FluencyCallCardHeader } from './card/FluencyCallCardHeader';
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
  padding: '0 0 10px 0',
};

export const FluencyCallCardView = ({
  canJoin,
  paidNotice,
  welcomeVideoSrc,
  onOpenVoiceChat,
}: FluencyCallCardViewProps) => {
  const uid = useId();

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
        <Stack
          sx={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gridTemplateAreas: '"request video"',
            alignItems: 'center',
            gap: '30px',
            padding: '0',
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
            <FluencyCallRequestSection onOpenVoiceChat={onOpenVoiceChat} />
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};
