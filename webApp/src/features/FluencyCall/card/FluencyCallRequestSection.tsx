'use client';

import { useState } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { Users } from 'lucide-react';
import { CommunityCallRequestModal } from '../CommunityCallRequestModal';
import { primaryButtonSx, token } from './styles';

export const FluencyCallRequestSection = ({ onOpenVoiceChat }: { onOpenVoiceChat: () => void }) => {
  const { i18n } = useLingui();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Stack data-testid="fluency-call-request" sx={{ gap: '16px', minWidth: 0 }}>
      <Stack sx={{ gap: '6px' }}>
        <Typography
          component="h4"
          sx={{ margin: 0, color: token.text, fontSize: '22px', fontWeight: 500 }}
        >
          {i18n._('Want to practice with people?')}
        </Typography>
        <Typography sx={{ margin: 0, color: token.muted }}>
          {i18n._(
            'Send more info about your interests, your English level, your fears, and I will arrange a call that works for you',
          )}
        </Typography>
      </Stack>
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
      {isOpen ? (
        <CommunityCallRequestModal
          onClose={() => setIsOpen(false)}
          onOpenVoiceChat={() => {
            setIsOpen(false);
            onOpenVoiceChat();
          }}
        />
      ) : null}
    </Stack>
  );
};
