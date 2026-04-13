import { useLingui } from '@lingui/react';
import { Stack } from '@mui/material';
import { useAuth } from '../../Auth/useAuth';
import { MessageActionButton } from '../MessageActionButton';
import { ThreadsMessage } from '../type';
import { useChat } from '../useChat';

export const MessageFooter = ({
  message,
  isContentWide,
  contentLeftPadding,
  toggleTranslation,
  isTranslateAvailable,
  isTranslating,
  gap,
  hideComments,
}: {
  message: ThreadsMessage;
  isContentWide: boolean;
  contentLeftPadding: string;
  toggleTranslation: () => void;
  isTranslateAvailable: boolean;
  isTranslating: boolean;
  gap?: string;
  hideComments?: boolean;
}) => {
  const { i18n } = useLingui();
  const chat = useChat();

  const myUserId = useAuth().uid;
  const commentsCount = chat.commentsInfo[message.id] || 0;
  const isLikedByMe = chat.messagesLikes[message.id]?.some((like) => like.userId === myUserId);

  return (
    <Stack
      sx={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: gap || '1px',
        paddingTop: '5px',
        paddingLeft: isContentWide ? '0px' : contentLeftPadding,
      }}
    >
      <MessageActionButton
        isActive={isLikedByMe}
        onClick={() => chat.toggleLike(message.id, 'like')}
        label={i18n._('Like')}
        count={chat.messagesLikes[message.id]?.length || 0}
        iconName={'heart'}
      />

      {!hideComments && (
        <MessageActionButton
          isActive={false}
          iconSize="17px"
          onClick={() => chat.setActiveCommentMessageId(message.id)}
          label={i18n._('Comment')}
          count={commentsCount}
          iconName={'message-circle'}
        />
      )}

      {isTranslateAvailable && (
        <MessageActionButton
          iconSize="17px"
          isActive={isTranslating}
          onClick={() => toggleTranslation()}
          label={i18n._('Translate')}
          iconName={'languages'}
        />
      )}
    </Stack>
  );
};
