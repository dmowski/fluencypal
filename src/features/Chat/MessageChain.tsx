'use client';
import { Button, Stack } from '@mui/material';
import { Message } from './Message';
import { useChat } from './useChat';
import { ChartSortMode, UserChatMessage } from './type';
import { useLingui } from '@lingui/react';
import { ChevronUp } from 'lucide-react';
import { useState } from 'react';

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

  if (sortMode === 'updates') {
    const messages = chat.messages.sort((a, b) => b.updatedAtIso.localeCompare(a.updatedAtIso));

    return (
      <Stack sx={{ gap: '40px' }}>
        {messages.map((message) => {
          return <RelyMessage key={message.id} message={message} messages={messages} />;
        })}
      </Stack>
    );
  }

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

const getAllParentMessages = (
  message: UserChatMessage,
  messages: UserChatMessage[],
): UserChatMessage[] => {
  const parents: UserChatMessage[] = [];
  let currentMessage = message;

  while (currentMessage.parentMessageId) {
    const parent = messages.find((m) => m.id === currentMessage.parentMessageId);
    if (parent) {
      parents.unshift(parent);
      currentMessage = parent;
    } else {
      break;
    }
  }

  return parents;
};

export const RelyMessage = ({
  message,
  messages,
}: {
  message: UserChatMessage;
  messages: UserChatMessage[];
}) => {
  const parent = message.parentMessageId
    ? messages.find((m) => m.id === message.parentMessageId)
    : null;

  const isMoreParents = parent?.parentMessageId;

  const { i18n } = useLingui();
  const [isShowAllParents, setIsShowAllParents] = useState(false);

  const parentsOfParent = parent && isShowAllParents ? getAllParentMessages(parent, messages) : [];

  return (
    <Stack
      key={message.id}
      sx={{
        padding: '0',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderLeft: 0,
        borderRight: 0,
      }}
    >
      {(!isMoreParents || isShowAllParents) && (
        <Stack
          sx={{
            padding: '20px 0 0 0',
            backgroundColor: 'rgba(255, 255, 255, 0.01)',
          }}
        />
      )}
      {isMoreParents && !isShowAllParents && (
        <Stack
          sx={{
            padding: '0px 10px 0 10px',
          }}
        >
          <Stack
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.01)',
              paddingTop: '12px',
            }}
          >
            <Button
              endIcon={<ChevronUp />}
              size="small"
              sx={{}}
              variant="text"
              onClick={() => setIsShowAllParents(true)}
            >
              {i18n._('Show previous')}
            </Button>
          </Stack>
        </Stack>
      )}
      {parentsOfParent.map((parent) => (
        <Message key={parent.id} message={parent} isFullContentByDefault={true} isChain />
      ))}
      {parent && <Message key={parent.id} message={parent} isFullContentByDefault={true} isChain />}
      <Message key={message.id} message={message} isFullContentByDefault={true} />

      {(!isMoreParents || isShowAllParents) && (
        <Stack
          sx={{
            padding: '20px 0 0 0',
            backgroundColor: 'rgba(255, 255, 255, 0.01)',
          }}
        />
      )}
    </Stack>
  );
};
