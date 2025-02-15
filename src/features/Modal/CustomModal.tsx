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
    <Modal open={isOpen} onClose={onClose}>
      <Stack
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: width || "600px",
          bgcolor: "background.paper",
          borderRadius: "16px",
          padding: "30px 40px 60px 40px",
          alignItems: "flex-start",
          gap: "30px",
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
