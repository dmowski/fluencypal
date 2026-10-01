'use client';

import { useEffect } from 'react';
import { Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { useAuth } from '@/features/Auth/useAuth';
import { CustomModal } from '@/features/uiKit/Modal/CustomModal';
import { ChatProvider } from '@/features/Chat/useChat';
import { ChatSection } from '@/features/Chat/ChatSection';
import { ensureFluencyCallChat, fluencyCallChatSpaceId } from './fluencyCallChat';

export const FluencyCallChatModal = ({
  callId,
  startsAtLabel,
  onClose,
}: {
  callId: string;
  startsAtLabel: string;
  onClose: () => void;
}) => {
  const { i18n } = useLingui();
  const auth = useAuth();

  useEffect(() => {
    if (!auth.uid) return;
    void ensureFluencyCallChat(auth.uid, callId);
  }, [auth.uid, callId]);

  return (
    <CustomModal
      isOpen={true}
      onClose={onClose}
      mobilePadding="40px 0"
      data-testid="fluency-call-chat"
    >
      <Stack
        sx={{
          maxWidth: '700px',
          width: '100%',
          gap: '20px',
          padding: '0 10px',
        }}
      >
        <Stack sx={{ gap: '6px' }}>
          <Typography variant="h3" sx={{ fontWeight: 800 }}>
            {i18n._('Call chat')}
          </Typography>
          {startsAtLabel ? (
            <Typography variant="h5" data-testid="fluency-call-chat-time" sx={{ fontWeight: 700 }}>
              {startsAtLabel}
            </Typography>
          ) : null}
          <Typography sx={{ color: 'text.secondary' }}>
            {i18n._('Talk about what you want to bring up on the call.')}
          </Typography>
        </Stack>

        <ChatProvider
          metadata={{
            spaceId: fluencyCallChatSpaceId(callId),
            allowedUserIds: null,
            isPrivate: false,
            type: 'fluencyCall',
          }}
        >
          <ChatSection
            contextForAiAnalysis=""
            placeholder={i18n._('What should we talk about?')}
            noMessagesPlaceholder={i18n._('No messages yet. Start the conversation.')}
          />
        </ChatProvider>
      </Stack>
    </CustomModal>
  );
};
