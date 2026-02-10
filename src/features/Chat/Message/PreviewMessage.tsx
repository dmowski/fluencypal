import { Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import { useAuth } from '../../Auth/useAuth';
import { useGame } from '../../Game/useGame';
import { UserName } from '../../User/UserName';
import { Attachments } from './Attachments';
import { ThreadsMessage } from '../type';
import { useChat } from '../useChat';
import { Avatar } from '../../Game/Avatar';
import { MessageContent } from './MessageContent';
import { MessageFooter } from './MessageFooter';

export const PreviewMessage = ({
  message,
  onOpen,
}: {
  message: ThreadsMessage;
  onOpen: (messageId: string) => void;
}) => {
  const game = useGame();
  const userAvatarUrl = game.getUserAvatarUrl(message.senderId);
  const userName = game.getUserName(message.senderId);
  const contentLimit = 120;
  const contentToShow =
    message.content.length > contentLimit
      ? message.content.slice(0, contentLimit) + '...'
      : message.content;

  const chat = useChat();
  const auth = useAuth();
  useEffect(() => {
    const timer = setTimeout(() => {
      if (message.id) {
        chat.viewMessage(message);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [message.id, auth.uid]);

  const ago = dayjs(message.createdAtIso).fromNow();

  return (
    <Stack
      key={message.id}
      onClick={() => onOpen(message.id)}
      sx={{
        borderRadius: '12px',
        padding: '15px 15px 10px 15px',
        backgroundColor: '#222327',
        width: '255px',
        gap: '0px',
      }}
    >
      <Stack
        sx={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: '8px',
          paddingBottom: '10px',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        <Avatar avatarSize={'26px'} url={userAvatarUrl} />
        <UserName userId={message.senderId} userName={userName} bold size="small" />
        <Typography
          variant="caption"
          sx={{
            opacity: 0.6,
            marginLeft: 'auto',
          }}
        >
          {ago}
        </Typography>
      </Stack>
      <MessageContent contentFontSize="14px">{contentToShow}</MessageContent>
      {message.attachments && message.attachments.length > 0 && (
        <Stack sx={{}}>
          <Attachments attachments={message.attachments} canDelete={false} maxWidth="120px" />
        </Stack>
      )}
      <Stack
        sx={{
          pointerEvents: 'none',
        }}
      >
        <MessageFooter
          message={message}
          gap="0"
          isContentWide={false}
          contentLeftPadding={'0px'}
          toggleTranslation={() => {}}
          isTranslateAvailable={false}
          isTranslating={false}
        />
      </Stack>
    </Stack>
  );
};
