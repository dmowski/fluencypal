import CallEndIcon from "@mui/icons-material/CallEnd";
import MicOffIcon from "@mui/icons-material/MicOff";
import MicIcon from "@mui/icons-material/Mic";

import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";

import { Button, IconButton, Stack, Typography } from "@mui/material";
import { useLingui } from "@lingui/react";

import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";

import LockIcon from "@mui/icons-material/Lock";
import WarningIcon from "@mui/icons-material/Warning";
import { BadgeQuestionMark, CircleQuestionMark } from "lucide-react";
import { useState } from "react";
import { CustomModal } from "@/features/uiKit/Modal/CustomModal";
import { TrialEndedSection } from "@/features/Usage/TrialEndedSection";

const CallButton = ({
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
          backgroundColor: isActive ? "rgba(100, 100, 100, 0.4)" : "rgb(250 222 220)",
          color: isActive ? "#fff" : "#222",
          ":hover": {
            backgroundColor: isActive ? "rgba(100, 100, 100, 0.2)" : "rgba(250, 222, 220, 0.8)",
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

export const CallButtons = ({
  isMuted,
  setIsMuted,
  isWebCamEnabled,
  toggleWebCam,

  exit,

  isVolumeOn,
  setIsVolumeOn,
  isLimited,
  onLimitedClick,
}: {
  isMuted: boolean;
  setIsMuted: (value: boolean) => void;
  isWebCamEnabled: boolean;
  toggleWebCam: (isToggleOn: boolean) => void;
  exit: () => void;

  isVolumeOn: boolean;
  setIsVolumeOn: (value: boolean) => void;
  isLimited: boolean;
  onLimitedClick: () => void;
}) => {
  const { i18n } = useLingui();

  const [isShowVolumeWarning, setIsShowVolumeWarning] = useState(false);

  const toggleVolume = () => {
    if (isLimited) {
      setIsShowVolumeWarning(true);
      return;
    }

    setIsVolumeOn(!isVolumeOn);
  };

  return (
    <Stack
      sx={{
        backgroundColor: "rgba(10, 18, 30, 1)",
        borderRadius: "20px",
        boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.3)",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        width: "max-content",
        padding: "10px 10px",
      }}
    >
      <CallButton
        activeButton={<MicIcon />}
        inactiveButton={<MicOffIcon />}
        isActive={isMuted}
        label={isMuted ? i18n._("Unmute microphone") : i18n._("Mute microphone")}
        onClick={() => setIsMuted(!isMuted)}
        isLocked={isLimited}
      />

      <CallButton
        activeButton={<VideocamIcon />}
        inactiveButton={<VideocamOffIcon />}
        isActive={isWebCamEnabled}
        label={isWebCamEnabled ? i18n._("Turn off video") : i18n._("Turn on video")}
        onClick={() => toggleWebCam(!isWebCamEnabled)}
      />

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

      <CallButton
        activeButton={<VolumeUpIcon />}
        inactiveButton={<VolumeOffIcon />}
        isActive={isVolumeOn}
        label={isVolumeOn ? i18n._("Turn off volume") : i18n._("Turn on volume")}
        onClick={toggleVolume}
        isLocked={isLimited}
      />
      {isShowVolumeWarning && (
        <CustomModal
          isOpen={true}
          onClose={() => {
            setIsShowVolumeWarning(false);
          }}
        >
          <Stack
            sx={{
              maxWidth: "400px",
              gap: "40px",
              alignItems: "center",
            }}
          >
            <Stack
              sx={{
                maxWidth: "500px",
                gap: "0px",
              }}
            >
              <Typography variant="h4" align="center">
                {i18n._("AI voice")}
              </Typography>
              <Typography
                align="center"
                variant="body2"
                sx={{
                  opacity: 0.7,
                }}
              >
                {i18n._(
                  "Enabling ai voice is a premium feature. Please upgrade your plan to access this feature."
                )}
              </Typography>
            </Stack>
            <TrialEndedSection onLimitedClick={onLimitedClick} />
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                setIsShowVolumeWarning(false);
              }}
            >
              {i18n._("Close")}
            </Button>
          </Stack>
        </CustomModal>
      )}
    </Stack>
  );
};
