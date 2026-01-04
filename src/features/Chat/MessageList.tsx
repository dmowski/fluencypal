"use client";
import { Typography, Box, Stack } from "@mui/material";
import { useGame } from "../Game/useGame";
import { UserChatMessage } from "./type";
import { useRef, useEffect } from "react";
import { Message } from "./Message";
import { useLingui } from "@lingui/react";

interface MessageListProps {
  messages: UserChatMessage[];
  currentUserId: string;
  onEdit: (messageId: string, newContent: string) => Promise<void>;
  onDelete: (messageId: string) => Promise<void>;
}

export function MessageList({ messages, currentUserId, onEdit, onDelete }: MessageListProps) {
  const game = useGame();
  const { i18n } = useLingui();

  const getUserName = (userId: string) => {
    return game.userNames?.[userId] || "Unknown";
  };

  const getUserAvatarUrl = (userId: string) => {
    return game.gameAvatars?.[userId] || "";
  };

  return (
    <Stack
      sx={{
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "12px",
        overflow: "hidden",
        ".message-item:not(:last-child)": {
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        },
      }}
    >
      {messages.length === 0 ? (
        <Typography align="center" color="textSecondary">
          {i18n._("No messages yet")}
        </Typography>
      ) : (
        <>
          {messages.map((message, index) => (
            <Stack key={message.id} className="message-item">
              <Message
                key={message.id}
                userAvatarUrl={getUserAvatarUrl(message.senderId)}
                message={message}
                isOwnMessage={message.senderId === currentUserId}
                userName={getUserName(message.senderId)}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </Stack>
          ))}
        </>
      )}
    </Stack>
  );
}
