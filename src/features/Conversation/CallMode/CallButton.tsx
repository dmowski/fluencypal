import { IconButton, Stack } from "@mui/material";
import { CircleQuestionMark } from "lucide-react";

export const CallButton = ({
  label,
  onClick,
  activeButton,
  inactiveButton,
  isActive,
  isLocked,
}: {
  label: string;
  onClick: () => void;
  activeButton: React.ReactNode;
  inactiveButton: React.ReactNode;
  isActive: boolean;
  isLocked?: boolean;
}) => {
  return (
    <Stack
      sx={{
        position: "relative",
      }}
    >
      <IconButton
        sx={{
          backgroundColor: isActive
            ? "rgba(100, 100, 100, 0.4)"
            : "rgb(250 222 220)",
          color: isActive ? "#fff" : "#222",
          ":hover": {
            backgroundColor: isActive
              ? "rgba(100, 100, 100, 0.2)"
              : "rgba(250, 222, 220, 0.8)",
          },
        }}
        size="large"
        onClick={() => onClick()}
        title={label}
      >
        {isActive ? activeButton : inactiveButton}
      </IconButton>
      {isLocked && (
        <Stack
          sx={{
            position: "absolute",
            bottom: "0px",
            right: "0px",
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            borderRadius: "100px",
            padding: "0px",
          }}
        >
          <CircleQuestionMark
            size={"17px"}
            style={{
              color: "rgba(115, 178, 255, 0.9)",
            }}
          />
        </Stack>
      )}
    </Stack>
  );
};
