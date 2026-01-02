"use client";
import { Stack } from "@mui/material";
import { useChat } from "./useChat";
import { useAuth } from "../Auth/useAuth";
import { SubmitForm } from "./SubmitForm";
import { MessageList } from "./MessageList";
import { useEffect } from "react";

export const ChartSection = () => {
  const auth = useAuth();
  const chat = useChat();
  const userId = auth.uid || "anonymous";

  useEffect(() => {
    chat.markAsRead();
  }, [chat.messages.length]);

  return (
    <Stack sx={{ height: "100%" }}>
      <MessageList
        messages={chat.messages}
        currentUserId={userId}
        onEdit={chat.editMessage}
        onDelete={chat.deleteMessage}
      />
      <SubmitForm onSubmit={chat.addMessage} isLoading={chat.loading} />
    </Stack>
  );
};
