import { Button, Stack, Typography } from "@mui/material";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { useLingui } from "@lingui/react";
import { Mic } from "lucide-react";

interface ConfirmConversationModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmConversationModal = ({
  onConfirm,
  onCancel,
}: ConfirmConversationModalProps) => {
  const { i18n } = useLingui();
  return (
    <CustomModal isOpen={true} onClose={() => onCancel()}>
      <Stack
        sx={{
          gap: "10px",
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Stack
          sx={{
            alignItems: "center",
          }}
        >
          <Typography variant="h4" component="h2" className="decor-text">
            {i18n._(`Ready?`)}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              maxWidth: "400px",
            }}
            align="center"
          >
            {i18n._(`Next, please allow access to the microphone to communicate with the AI.`)}
          </Typography>
        </Stack>

        <Stack
          sx={{
            flexDirection: "row",
            alignItems: "center",
            paddingTop: "10px",
            gap: "20px",
          }}
        >
          <Stack
            sx={{
              flexDirection: "row",
              alignItems: "center",
              gap: "15px",
            }}
          >
            <Button
              onClick={onConfirm}
              variant="contained"
              color="info"
              size="large"
              startIcon={<Mic />}
            >
              {i18n._(`Yes, I am ready`)}
            </Button>
          </Stack>
          <Button variant="outlined" onClick={onCancel}>
            {i18n._(`No`)}
          </Button>
        </Stack>
      </Stack>
    </CustomModal>
  );
};
