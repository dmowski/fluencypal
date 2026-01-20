import { Button, Stack, TextField, Typography } from "@mui/material";
import { CustomModal } from "../uiKit/Modal/CustomModal";

import { useLingui } from "@lingui/react";
import { useState } from "react";
import { useAuth } from "../Auth/useAuth";
import { sendFeedbackMessageRequest } from "@/app/api/telegram/sendFeedbackMessageRequest";

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
        await auth.getToken(),
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
    <CustomModal isOpen={true} onClose={() => onClose()}>
      <Stack
        sx={{
          gap: "20px",
          boxSizing: "border-box",
          width: "100%",
          maxWidth: "600px",
          "@media (max-width: 600px)": {},
        }}
      >
        <Stack>
          <Typography variant="h5" component="h2" align="center">
            {title}
          </Typography>
          <Typography
            align="center"
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
          }}
          component={"form"}
          onSubmit={(e) => {
            e.preventDefault();
            onSendFeedback();
          }}
        >
          <Stack
            sx={{
              width: "100%",
              gap: "20px",
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
            <Stack
              sx={{
                width: "100%",
              }}
            >
              <Button
                variant="contained"
                type="submit"
                color="info"
                disabled={isSending}
                sx={{
                  minWidth: "300px",
                }}
              >
                {isSending ? i18n._(`Sending...`) : i18n._(`Send`)}
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </CustomModal>
  );
};
