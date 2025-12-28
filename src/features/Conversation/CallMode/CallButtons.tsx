import CallEndIcon from "@mui/icons-material/CallEnd";
import MicOffIcon from "@mui/icons-material/MicOff";
import MicIcon from "@mui/icons-material/Mic";

import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";

import { IconButton, Stack } from "@mui/material";

export const CallButtons = ({
  isMuted,
  setIsMuted,
  isWebCamEnabled,
  toggleWebCam,

  exit,
}: {
  isMuted: boolean;
  setIsMuted: (value: boolean) => void;
  isWebCamEnabled: boolean;
  toggleWebCam: (isToggleOn: boolean) => void;
  exit: () => void;
}) => {
  return (
    <Stack
      sx={{
        backgroundColor: "rgba(10, 18, 30, 1)",
        borderRadius: "90px",
        boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.3)",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        width: "max-content",
        padding: "10px 10px",
      }}
    >
      <IconButton
        sx={{
          backgroundColor: !isMuted ? "rgba(100, 100, 100, 0.4)" : "rgb(250 222 220)",
          color: !isMuted ? "#fff" : "#222",
          ":hover": {
            backgroundColor: !isMuted ? "rgba(100, 100, 100, 0.2)" : "rgba(250, 222, 220, 0.8)",
          },
        }}
        size="large"
        onClick={() => setIsMuted(!isMuted)}
      >
        {isMuted ? <MicOffIcon /> : <MicIcon />}
      </IconButton>

      <IconButton
        sx={{
          backgroundColor: isWebCamEnabled ? "rgba(100, 100, 100, 0.4)" : "rgb(250 222 220)",
          color: isWebCamEnabled ? "#fff" : "#222",
          ":hover": {
            backgroundColor: isWebCamEnabled
              ? "rgba(100, 100, 100, 0.2)"
              : "rgba(250, 222, 220, 0.8)",
          },
        }}
        size="large"
        onClick={async () => {
          if (isWebCamEnabled) {
            toggleWebCam(false);
          } else {
            toggleWebCam(true);
          }
        }}
      >
        {isWebCamEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
      </IconButton>

      <IconButton
        size="large"
        onClick={exit}
        sx={{
          width: "70px",
          borderRadius: "30px",
          backgroundColor: "#dc362e",
          ":hover": { backgroundColor: "rgba(255, 0, 0, 0.7)" },
        }}
      >
        <CallEndIcon />
      </IconButton>
    </Stack>
  );
};
