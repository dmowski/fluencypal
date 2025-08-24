import { Button, Stack, TextField, Typography } from "@mui/material";
import { CustomModal } from "../uiKit/Modal/CustomModal";

import { useLingui } from "@lingui/react";
import { useState } from "react";
import { useAuth } from "../Auth/useAuth";
import { sendFeedbackMessageRequest } from "@/app/api/telegram/sendFeedbackMessageRequest";
import { useWindowSizes } from "../Layout/useWindowSizes";

interface ContactMessageModalProps {
  onClose: () => void;
  title: string;
  subTitle: string;
  placeholder: string;
}

export const ContactMessageModal = ({
  onClose,
  title,
  subTitle,
  placeholder,
}: ContactMessageModalProps) => {
  const { i18n } = useLingui();
  const { topOffset } = useWindowSizes();
  const [feedback, setFeedback] = useState("");
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

    alert(i18n._(`Thank you for your feedback!`));
    setFeedback("");
    setIsSending(false);
  };

  return (
    <CustomModal isOpen={true} onClose={() => onClose()} padding="max(20px, 2vw)">
      <Stack
        sx={{
          width: "100%",
          gap: "10px",
        }}
        component={"form"}
        onSubmit={(e) => {
          e.preventDefault();
          onSendFeedback();
        }}
      >
        <Stack
          sx={{
            paddingTop: `0`,
          }}
        >
          <Typography variant="h5">{title}</Typography>
          <Typography
            variant="caption"
            sx={{
              opacity: 0.7,
            }}
          >
            {subTitle}
          </Typography>
        </Stack>

        <Stack
          sx={{
            width: "100%",
            gap: "10px",
            alignItems: "flex-start",
          }}
        >
          <TextField
            sx={{
              width: "100%",
            }}
            value={feedback}
            required
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={placeholder || i18n._(`Leave your message`)}
            multiline
            rows={3}
          />
          <Button variant="contained" type="submit" disabled={isSending}>
            {isSending ? i18n._(`Sending...`) : i18n._(`Send`)}
          </Button>
        </Stack>
      </Stack>
    </CustomModal>
  );
};
