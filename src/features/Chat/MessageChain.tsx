"use client";
import { Stack } from "@mui/material";
import { Message } from "./Message";
import { useChat } from "./useChat";

interface MessageChainProps {
  parentId: string | null;
  topLevel?: boolean;
  isLast?: boolean;
}

export function MessageChain({ parentId, topLevel = false, isLast }: MessageChainProps) {
  const chat = useChat();
  const rootMessage = parentId ? chat.messages.find((m) => m.id === parentId) : null;

  const messages = parentId
    ? chat.messages
        .filter((m) => m.parentMessageId === parentId)
        .sort((a, b) => a.createdAtIso.localeCompare(b.createdAtIso))
    : chat.messages
        .filter((m) => !m.parentMessageId)
        .sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso));

  if (!parentId) {
    return (
      <Stack>
        {messages.map((message, index, all) => {
          const isLast = index === all.length - 1;
          return (
            <MessageChain key={message.id} parentId={message.id} topLevel={false} isLast={isLast} />
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
        borderBottom: isLast || topLevel ? "none" : "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      {rootMessage && (
        <Message key={rootMessage.id} message={rootMessage} isChain={!!childMessages.length} />
      )}

      {childMessages.map((message, index, all) => {
        const isLast = index === all.length - 1;
        return <MessageChain key={message.id} parentId={message.id} isLast={isLast} />;
      })}
    </Stack>
  );
}
