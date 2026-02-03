import { useMemo, useState } from 'react';
import { useChat } from './useChat';
import { NoMessagesPlaceholder } from './NoMessagesPlaceholder';
import { useLingui } from '@lingui/react';
import { Stack } from '@mui/material';
import { Message } from './Message';
import { ShowPreviousMessagesButton } from './ShowPreviousMessagesButton';
import { SubmitForm } from './SubmitForm';

export const FlatChat = ({}: {}) => {
  const chat = useChat();
  const { i18n } = useLingui();

  const sorterMessages = useMemo(() => {
    return chat.messages.sort((a, b) => a.createdAtIso.localeCompare(b.createdAtIso));
  }, [chat.messages]);

  const [limit, setLimit] = useState<number>(3);
  const isNeedToShowLoadMore = limit && chat.messages.length > limit;
  const showPreviousMessages = () => {
    setLimit(limit + 10);
  };

  const messagesToShow = useMemo(() => {
    if (isNeedToShowLoadMore) {
      return sorterMessages.slice(-limit);
    }
    return sorterMessages;
  }, [isNeedToShowLoadMore, sorterMessages, limit]);

  return (
    <Stack
      sx={{
        borderRadius: '12px',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
      }}
    >
      {isNeedToShowLoadMore && (
        <Stack
          sx={{
            padding: '0',
          }}
        >
          <ShowPreviousMessagesButton onClick={showPreviousMessages} />
        </Stack>
      )}

      {messagesToShow.length > 0 && (
        <Stack>
          {messagesToShow.map((message, index, all) => (
            <Message
              key={message.id}
              message={message}
              isFullContentByDefault={true}
              hideComments
              preventOpen
              isChain={index < all.length - 1}
            />
          ))}

          <Stack
            sx={{
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <SubmitForm
              onSubmit={async (message: string) => {
                await chat.addMessage({
                  messageContent: message,
                  parentMessageId: '',
                });
              }}
              isLoading={false}
              recordMessageTitle={i18n._('Record your message')}
              setIsActiveRecording={() => {}}
              previousBotMessage={''}
            />
          </Stack>
        </Stack>
      )}
      {chat.messages.length === 0 && (
        <NoMessagesPlaceholder noMessagesPlaceholder={i18n._('No messages yet')} />
      )}
    </Stack>
  );
};
