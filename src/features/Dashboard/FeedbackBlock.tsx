"use client";

import { Trans, useLingui } from "@lingui/react/macro";
import { Button, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useAuth } from "../Auth/useAuth";
import { sendFeedbackMessageRequest } from "@/app/api/telegram/sendFeedbackMessageRequest";

export function FeedbackBlock() {
  const [feedback, setFeedback] = useState("");
  const { i18n } = useLingui();
  const auth = useAuth();
  const [isSending, setIsSending] = useState(false);
  const onSendFeedback = async () => {
    setIsSending(true);
    try {
      await sendFeedbackMessageRequest(
        {
          message: feedback,
        },
        await auth.getToken()
      );
    } catch (error) {
      console.error("Error sending feedback:", error);
      alert(i18n._(`Failed to send feedback. Please try again later.`));
      setIsSending(false);
      throw error;
    }

    alert(i18n._(`Thank you for your message`));
    setFeedback("");
    setIsSending(false);
  };
  return (
    <Stack
      sx={{
        padding: "20px",
        maxWidth: "600px",
        gap: "10px",
      }}
    >
      <Typography>
        <Trans>Your feedback is valuable to me</Trans>
      </Typography>
      <TextField
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder={i18n._(`Leave your feedback`)}
        multiline
        rows={3}
      />
      <Button variant="outlined" onClick={onSendFeedback} disabled={!feedback || isSending}>
        {isSending ? <Trans>Sending...</Trans> : <Trans>Send Feedback</Trans>}
      </Button>
    </Stack>
  );
}
