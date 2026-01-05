"use client";
import { Typography, Box, Stack } from "@mui/material";
import { useGame } from "../Game/useGame";
import { UserChatMessage } from "./type";
import { Message } from "./Message";
import { useLingui } from "@lingui/react";
import { useChat } from "./useChat";

interface MessageListProps {
  messages: UserChatMessage[];
  currentUserId: string;
  onEdit: (messageId: string, newContent: string) => Promise<void>;
  onDelete: (messageId: string) => Promise<void>;
  onCommentClick: (messageId: string) => void;
  onOpen: (messageId: string) => void;
}

export function MessageList(props: MessageListProps) {
  const game = useGame();
  const { i18n } = useLingui();
  const chat = useChat();

  return (
    <Stack
      sx={{
        overflow: "hidden",
        ".message-item:not(:last-child)": {
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        },
      }}
    >
      {props.messages.length === 0 ? (
        <Typography align="center" color="textSecondary">
          {i18n._("No messages yet")}
        </Typography>
      ) : (
        <>
          {props.messages.map((message, index) => (
            <Stack key={message.id} className="message-item">
              <Message
                onOpen={props.onOpen}
                key={message.id}
                userAvatarUrl={game.getUserAvatarUrl(message.senderId)}
                message={message}
                isOwnMessage={message.senderId === props.currentUserId}
                userName={game.getUserName(message.senderId)}
                onEdit={props.onEdit}
                onDelete={props.onDelete}
                onCommentClick={() => props.onCommentClick(message.id)}
                commentsCount={chat.commentsInfo[message.id] || 0}
              />
            </Stack>
          ))}
        </>
      )}
    </Stack>
  );
}
