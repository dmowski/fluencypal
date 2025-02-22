import { IconButton, Modal, Stack } from "@mui/material";
import { X } from "lucide-react";
import { JSX } from "react";

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
}

export const CustomModal = ({
  isOpen,
  onClose,
  width,
  children,
}: CustomModalProps): JSX.Element => {
  if (!isOpen) return <></>;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      sx={{}}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.9)",
          },
        },
      }}
    >
      <Stack
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: width || "600px",
          bgcolor: "#222224",
          borderRadius: "16px",
          padding: "40px 40px 40px 40px",
          alignItems: "flex-start",
          gap: "30px",
          boxSizing: "border-box",
          maxWidth: "100vw",
        }}
      >
        <IconButton
          sx={{ position: "absolute", top: "10px", right: "10px" }}
          onClick={() => onClose()}
        >
          <X />
        </IconButton>
        {children}
      </Stack>
    </Modal>
  );
};
