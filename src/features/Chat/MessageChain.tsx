'use client';
import { Button, Stack } from '@mui/material';
import { Message } from './Message';
import { useChat } from './useChat';
import { ChartSortMode } from './type';
import { RelyMessage } from './RelyMessage';
import { useState } from 'react';
import { useLingui } from '@lingui/react';
import { ChevronDown } from 'lucide-react';

interface MessageChainProps {
  parentId: string | null;
  topLevel?: boolean;
  isLast?: boolean;
  limitTopMessages?: number;
  isFullContentByDefault?: boolean;
  sortMode?: ChartSortMode;
}

export function MessageChain({
  parentId,
  topLevel = false,
  isLast,
  limitTopMessages,
  isFullContentByDefault,
  sortMode,
}: MessageChainProps) {
  const chat = useChat();
  const { i18n } = useLingui();
  const rootMessage = parentId ? chat.messages.find((m) => m.id === parentId) : null;
  const [limit, setLimit] = useState<number | undefined>(
    (limitTopMessages ?? topLevel) ? 10 : undefined,
  );

  const messages = parentId
    ? chat.messages
        .filter((m) => m.parentMessageId === parentId)
        .sort((a, b) => a.createdAtIso.localeCompare(b.createdAtIso))
    : chat.messages
        .filter((m) => !m.parentMessageId)
        .sort((a, b) =>
          chat.getLastActivityOnMessage(b.id).localeCompare(chat.getLastActivityOnMessage(a.id)),
        );

  if (sortMode === 'replies') {
    const messagesToShow = chat.messages
      .sort((a, b) => b.updatedAtIso.localeCompare(a.updatedAtIso))
      .filter((_, index) => {
        if (limit) {
          return index < limit;
        }
        return true;
      });

    const isNeedToShowLoadMore = limit && messages.length > limit;

    return (
      <Stack sx={{ gap: '40px' }}>
        {messagesToShow.map((message) => {
          return <RelyMessage key={message.id} message={message} messages={chat.messages} />;
        })}

        {isNeedToShowLoadMore && (
          <Stack
            sx={{
              padding: '10px 20px',
            }}
          >
            <Button endIcon={<ChevronDown size={16} />} onClick={() => setLimit((limit ?? 0) + 10)}>
              {i18n._('Load more')}
            </Button>
          </Stack>
        )}
      </Stack>
    );
  }

  if (!parentId) {
    const messagesToShow = messages.filter((_, index) => {
      if (limit) {
        return index < limit;
      }
      return true;
    });
    const isNeedToShowLoadMore = limit && messages.length > limit;

    return (
      <Stack>
        {messagesToShow.map((message, index, all) => {
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
        {isNeedToShowLoadMore && (
          <Stack
            sx={{
              padding: '10px 20px',
            }}
          >
            <Button endIcon={<ChevronDown size={16} />} onClick={() => setLimit((limit ?? 0) + 10)}>
              {i18n._('Load more')}
            </Button>
          </Stack>
        )}
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
