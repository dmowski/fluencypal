"use client";
import { Box, TextField, IconButton, CircularProgress } from "@mui/material";
import { useState } from "react";
import SendIcon from "@mui/icons-material/Send";
import { useLingui } from "@lingui/react";

interface SubmitFormProps {
  onSubmit: (message: string) => Promise<void>;
  isLoading: boolean;
}

export function SubmitForm({ onSubmit, isLoading }: SubmitFormProps) {
  const [messageContent, setMessageContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { i18n } = useLingui();

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
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ padding: "30px 0 10px 0", display: "flex", gap: 1 }}
    >
      <TextField
        fullWidth
        placeholder={i18n._("Type a message...")}
        value={messageContent}
        onChange={(e) => setMessageContent(e.target.value)}
        disabled={isSending || isLoading}
        multiline
        maxRows={12}
        variant="outlined"
        size="small"
        sx={{}}
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
