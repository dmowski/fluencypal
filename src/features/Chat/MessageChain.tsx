'use client';
import { Stack } from '@mui/material';
import { Message } from './Message';
import { useChat } from './useChat';

interface MessageChainProps {
  parentId: string | null;
  topLevel?: boolean;
  isLast?: boolean;
  limitTopMessages?: number;
  isFullContentByDefault?: boolean;
}

export function MessageChain({
  parentId,
  topLevel = false,
  isLast,
  limitTopMessages,
  isFullContentByDefault,
}: MessageChainProps) {
  const chat = useChat();
  const rootMessage = parentId ? chat.messages.find((m) => m.id === parentId) : null;

  const messages = parentId
    ? chat.messages
        .filter((m) => m.parentMessageId === parentId)
        .sort((a, b) => a.createdAtIso.localeCompare(b.createdAtIso))
    : chat.messages
        .filter((m) => !m.parentMessageId)
        .sort((a, b) =>
          chat.getLastActivityOnMessage(b.id).localeCompare(chat.getLastActivityOnMessage(a.id)),
        );

  if (!parentId) {
    return (
      <Stack>
        {messages
          .filter((_, index) => {
            if (limitTopMessages) {
              return index < limitTopMessages;
            }
            return true;
          })
          .map((message, index, all) => {
            const isLast = index === all.length - 1;
            return (
              <MessageChain
                key={message.id}
                parentId={message.id}
                topLevel={false}
                isLast={isLast}
                isFullContentByDefault={isFullContentByDefault}
              />
            );
          })}
      </Stack>
    );
  }

  const childMessages = messages.filter((msg, index) => {
    if (topLevel) {
      return true;
    }
    return index === 0;
  });

  return (
    <Stack
      sx={{
        borderBottom: isLast || topLevel ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {rootMessage && (
        <Message
          key={rootMessage.id}
          message={rootMessage}
          isChain={!!childMessages.length}
          isFullContentByDefault={topLevel || isFullContentByDefault}
        />
      )}

      {childMessages.map((message, index, all) => {
        const isLast = index === all.length - 1;
        return (
          <MessageChain
            key={message.id}
            parentId={message.id}
            isLast={isLast}
            isFullContentByDefault={isFullContentByDefault}
          />
        );
      })}
    </Stack>
  );
}
