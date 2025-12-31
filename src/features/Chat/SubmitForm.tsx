"use client";
import { Box, TextField, IconButton, CircularProgress } from "@mui/material";
import { useState } from "react";
import SendIcon from "@mui/icons-material/Send";

// SubmitForm Component - Form to send new message
interface SubmitFormProps {
  onSubmit: (message: string) => Promise<void>;
  isLoading: boolean;
}

export function SubmitForm({ onSubmit, isLoading }: SubmitFormProps) {
  const [messageContent, setMessageContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (messageContent.trim() && !isSending && !isLoading) {
      setIsSending(true);
      await onSubmit(messageContent);
      setMessageContent("");
      setIsSending(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2, display: "flex", gap: 1 }}>
      <TextField
        fullWidth
        placeholder="Type a message..."
        value={messageContent}
        onChange={(e) => setMessageContent(e.target.value)}
        disabled={isSending || isLoading}
        multiline
        maxRows={4}
        variant="outlined"
        size="small"
      />
      <IconButton
        type="submit"
        disabled={!messageContent.trim() || isSending || isLoading}
        sx={{ alignSelf: "flex-end" }}
      >
        {isSending ? <CircularProgress size={20} /> : <SendIcon />}
      </IconButton>
    </Box>
  );
}
