import { Stack, Typography } from '@mui/material';
import { ChatProvider } from '../Chat/useChat';
import { useAuth } from '../Auth/useAuth';
import { ChatSection } from '../Chat/ChatSection';
import { useLingui } from '@lingui/react';

const supportUserId = 'Mq2HfU3KrXTjNyOpPXqHSPg5izV2';

export const SupportPage = () => {
  const auth = useAuth();
  const { i18n } = useLingui();

  const users = [auth.uid, supportUserId];
  const chatSpace = `support_${users.sort((a, b) => a.localeCompare(b)).join('_')}`;
  if (!auth.uid) return null;
  return (
    <Stack
      sx={{
        gap: '20px',
      }}
    >
      <Stack
        sx={{
          gap: '5px',
        }}
      >
        <Typography variant="h5">{i18n._(`Need help?`)}</Typography>
        <Typography variant="caption">
          {i18n._(
            `If you have any questions regarding your payment history, you can write message here. We will answer you as soon as possible.`,
          )}
        </Typography>
      </Stack>

      <ChatProvider
        metadata={{
          spaceId: chatSpace,
          allowedUserIds: users,
          isPrivate: true,
          type: 'privateChat',
        }}
      >
        <ChatSection
          contextForAiAnalysis=""
          placeholder={i18n._('Add your problem here...')}
          noMessagesPlaceholder={i18n._('No support messages yet')}
        />
      </ChatProvider>
    </Stack>
  );
};
