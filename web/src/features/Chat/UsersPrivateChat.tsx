import { Stack } from '@mui/material';
import { ChatProvider } from './useChat';
import { ChatSection } from './ChatSection';

export const UsersPrivateChat = ({ userIds }: { userIds: string[] }) => {
  const sorterUserIds = [...userIds].sort((a, b) => a.localeCompare(b));
  const chatSpace = `u_${sorterUserIds.join('_')}`;

  return (
    <Stack>
      <ChatProvider
        metadata={{
          spaceId: chatSpace,
          allowedUserIds: sorterUserIds,
          isPrivate: true,
          type: 'privateChat',
        }}
      >
        <ChatSection contextForAiAnalysis="" />
      </ChatProvider>
    </Stack>
  );
};
