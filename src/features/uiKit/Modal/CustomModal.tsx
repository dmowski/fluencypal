import { IconButton, Modal, Stack } from "@mui/material";
import { X } from "lucide-react";
import { JSX } from "react";

interface CustomModalProps {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  width?: string;
  padding?: string;
  maxHeight?: string;
}

export const CustomModal = ({
  isOpen,
  onClose,
  width,
  children,
  padding,
  maxHeight,
}: CustomModalProps): JSX.Element => {
  if (!isOpen) return <></>;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      sx={{
        zIndex: 1000,
      }}
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
          backgroundColor: "#181818",
          borderRadius: "16px",
          maxWidth: "100vw",
          maxHeight: maxHeight || "100dvh",
          "@media (max-width: 600px)": {
            borderRadius: 0,
          },
        }}
      >
        {onClose && (
          <IconButton
            sx={{
              position: "absolute",
              top: "10px",
              right: "10px",
              zIndex: 100,
            }}
            onClick={() => onClose()}
            size="large"
          >
            <X />
          </IconButton>
        )}
        <Stack
          sx={{
            alignItems: "flex-start",
            gap: "30px",
            width: "100%",
            maxHeight: "100vh",
            overflowY: "auto",
            padding: padding || "40px 40px 40px 40px",
            boxSizing: "border-box",
          }}
        >
          {children}
        </Stack>
      </Stack>
    </Modal>
  );
};
