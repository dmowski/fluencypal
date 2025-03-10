import { Stack, Tooltip } from "@mui/material";
import { Volume2, VolumeOff } from "lucide-react";

interface ButtonProps {
  isEnabled: boolean;
  onClick: () => void;
}

export const VolumeButton: React.FC<ButtonProps> = ({ isEnabled, onClick }) => {
  return (
    <Tooltip title={isEnabled ? "Mute audio output" : "Enable audio response"} arrow>
      <Stack>
        <button
          style={{
            backgroundColor: isEnabled ? "#0f4564" : "rgba(255, 255, 255, 0.3)",
            width: "47px",
            height: "47px",
            position: "relative",
            cursor: "pointer",
            border: "none",
            outline: "none",
            borderRadius: "50%",
            padding: "0",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "#fff",
            opacity: isEnabled ? 1 : 0.4,
            boxShadow: isEnabled
              ? "0 0 0 4px rgba(18, 112, 166, 0.1)"
              : "0 0 0 4px rgba(255, 255, 255, 0.2)",
          }}
          onClick={() => onClick()}
        >
          {isEnabled ? <Volume2 /> : <VolumeOff />}
        </button>
      </Stack>
    </Tooltip>
  );
};
