"use client";
import { Stack } from "@mui/material";
import { useChat } from "./useChat";
import { useAuth } from "../Auth/useAuth";
import { SubmitForm } from "./SubmitForm";
import { MessageList } from "./MessageList";

export const ChartSection = () => {
  const auth = useAuth();
  const chat = useChat();
  const userId = auth.uid || "anonymous";

  return (
    <Stack sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
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
