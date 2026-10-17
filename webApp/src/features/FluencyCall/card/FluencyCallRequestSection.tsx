'use client';

import { useState } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { Users } from 'lucide-react';
import { CommunityCallRequestModal } from '../CommunityCallRequestModal';
import { narrow, primaryButtonSx, token } from './styles';

export const FluencyCallRequestSection = ({
  onOpenVoiceChat,
}: {
  onOpenVoiceChat?: () => void;
}) => {
  const { i18n } = useLingui();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Stack data-testid="fluency-call-request" sx={{ gap: '16px', minWidth: 0 }}>
      <Stack sx={{ gap: '6px' }}>
        <Typography
          component="h2"
          sx={{
            margin: 0,
            color: token.text,
            fontSize: '23px',
            lineHeight: 1.3,
            fontWeight: 650,
            letterSpacing: '-0.5px',
            minWidth: 0,
            overflowWrap: 'anywhere',
            [narrow]: { fontSize: '21px' },
          }}
        >
          {i18n._('Want to practice with people?')}
        </Typography>
        <Typography sx={{ margin: 0, color: token.muted }}>
          {onOpenVoiceChat
            ? i18n._(
                'Send more info about your interests, your English level and I will arrange a call that works for you. Or open voice chat and start talking with people by sending a voice message.',
              )
            : i18n._(
                'Send more info about your interests, your English level and I will arrange a call that works for you.',
              )}
        </Typography>
      </Stack>
      <Stack
        sx={{
          gap: '16px',
          flexDirection: 'row',
          flexWrap: 'wrap',
        }}
      >
        <Button
          data-testid="fluency-call-open-request"
          data-analytics="community-call-open-request"
          variant="contained"
          color="info"
          onClick={() => setIsOpen(true)}
          startIcon={<Users size={18} />}
          sx={{
            ...primaryButtonSx,
            alignSelf: 'flex-start',
            maxWidth: '100%',
            whiteSpace: 'normal',
            textAlign: 'center',
          }}
        >
          {i18n._('Request a call')}
        </Button>
        {onOpenVoiceChat ? (
          <Button
            data-testid="fluency-call-open-voice-chat"
            data-analytics="voice-chat-open"
            variant="outlined"
            color="info"
            onClick={onOpenVoiceChat}
            sx={{
              ...primaryButtonSx,
              alignSelf: 'flex-start',
              maxWidth: '100%',
              whiteSpace: 'normal',
              textAlign: 'center',
            }}
          >
            {i18n._('Open voice chat')}
          </Button>
        ) : null}
      </Stack>
      {isOpen ? (
        <CommunityCallRequestModal
          onClose={() => setIsOpen(false)}
          onOpenVoiceChat={
            onOpenVoiceChat
              ? () => {
                  setIsOpen(false);
                  onOpenVoiceChat();
                }
              : undefined
          }
        />
      ) : null}
    </Stack>
  );
};
