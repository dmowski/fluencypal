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
        }}
      >
        <Stack>
          <Typography variant="h4" component="h2" className="decor-text">
            {i18n._(`Ready?`)}
          </Typography>
        </Stack>

        <Typography>{i18n._(`Next, allow microphone access to talk with the AI.`)}</Typography>

        <Stack
          sx={{
            flexDirection: "row",
            width: "100%",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "10px",
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
              {i18n._(`I am ready`)}
            </Button>
          </Stack>
          <Button onClick={onCancel}>{i18n._(`Close`)}</Button>
        </Stack>
      </Stack>
    </CustomModal>
  );
};
