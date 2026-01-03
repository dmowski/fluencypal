import CallEndIcon from "@mui/icons-material/CallEnd";
import MicOffIcon from "@mui/icons-material/MicOff";
import MicIcon from "@mui/icons-material/Mic";

import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";

import { Button, IconButton, Stack, Typography } from "@mui/material";
import { useLingui } from "@lingui/react";

import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";

import { CircleQuestionMark, Mic, Send } from "lucide-react";
import { useState } from "react";
import { CustomModal } from "@/features/uiKit/Modal/CustomModal";
import { FeatureBlocker } from "@/features/Usage/FeatureBlocker";
import { useAuth } from "@/features/Auth/useAuth";
import { useAudioRecorder } from "@/features/Audio/useAudioRecorder";
import { useSettings } from "@/features/Settings/useSettings";
import SendIcon from "@mui/icons-material/Send";
import StopIcon from "@mui/icons-material/Stop";

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

  onSubmitTranscription,
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

  onSubmitTranscription: (userMessage: string) => void;
}) => {
  const { i18n } = useLingui();

  const [isShowVolumeWarning, setIsShowVolumeWarning] = useState(false);
  const [isShowMuteWarning, setIsShowMuteWarning] = useState(false);

  const toggleMute = () => {
    if (isLimited) {
      setIsShowMuteWarning(true);
      return;
    }

    setIsMuted(!isMuted);
  };

  const toggleVolume = () => {
    if (isLimited) {
      setIsShowVolumeWarning(true);
      return;
    }

    setIsVolumeOn(!isVolumeOn);
  };

  const auth = useAuth();
  const settings = useSettings();
  const lang = settings.languageCode || "en";
  const recorder = useAudioRecorder({
    languageCode: lang,
    getAuthToken: auth.getToken,
    isFree: true,
    isGame: false,
    visualizerComponentWidth: "100%",
  });
  const transcription = recorder.transcription;

  const submitTranscription = () => {
    onSubmitTranscription(transcription || "");
    recorder.removeTranscript();
    recorder.cancelRecording();
    setIsShowMuteWarning(false);
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
        isActive={!isMuted}
        label={isMuted ? i18n._("Unmute microphone") : i18n._("Mute microphone")}
        onClick={toggleMute}
        isLocked={isLimited}
      />

      <CallButton
        activeButton={<VolumeUpIcon />}
        inactiveButton={<VolumeOffIcon />}
        isActive={isVolumeOn}
        label={isVolumeOn ? i18n._("Turn off volume") : i18n._("Turn on volume")}
        onClick={toggleVolume}
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

      {(isShowVolumeWarning || isShowMuteWarning) && (
        <CustomModal
          isOpen={true}
          onClose={() => {
            setIsShowVolumeWarning(false);
            setIsShowMuteWarning(false);
            recorder.cancelRecording();
            recorder.removeTranscript();
          }}
        >
          <Stack
            sx={{
              maxWidth: "400px",
              gap: "40px",
              alignItems: "center",
              paddingTop: "25px",
            }}
          >
            <Stack
              sx={{
                maxWidth: "500px",
                gap: "0px",
              }}
            >
              <Typography variant="h5">
                {isShowVolumeWarning ? i18n._("AI voice") : i18n._("Real-time microphone")}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  opacity: 0.7,
                }}
              >
                {isShowVolumeWarning
                  ? i18n._(
                      "Enabling ai voice is a premium feature. Please upgrade your plan to access this feature."
                    )
                  : i18n._(
                      "Using real-time microphone is a premium feature. Please upgrade your plan to access this feature or use recorded audio."
                    )}
              </Typography>
            </Stack>

            {isShowMuteWarning && (
              <Stack
                sx={{
                  width: "100%",
                  //padding: "15px",
                  //border: "1px solid rgba(255, 255, 255, 0.2)",
                  //borderRadius: "10px",
                  gap: "20px",
                  alignItems: "flex-start",
                }}
              >
                <Stack
                  sx={{
                    gap: "5px",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={
                      {
                        //opacity: 0.8,
                      }
                    }
                    className={`${recorder.isTranscribing ? "loading-shimmer" : ""}`}
                  >
                    {i18n._("Your Message:")}
                  </Typography>
                  <Typography
                    variant="body1"
                    className={`${recorder.isTranscribing ? "loading-shimmer" : ""}`}
                    sx={{
                      opacity: !recorder.transcription ? 0.5 : 1,
                    }}
                  >
                    {recorder.isTranscribing
                      ? i18n._("Loading...")
                      : recorder.transcription || i18n._("No message recorded yet.")}
                  </Typography>
                </Stack>
                <Stack
                  sx={{
                    width: "100%",
                    gap: "10px",
                  }}
                >
                  <Stack
                    sx={{
                      flexDirection: "row",
                      width: "100%",
                      alignItems: "center",
                    }}
                  >
                    <Button
                      disabled={recorder.isTranscribing}
                      variant={recorder.transcription ? "outlined" : "contained"}
                      color={recorder.isRecording ? "error" : "info"}
                      sx={{
                        width: "100%",
                      }}
                      onClick={() => {
                        if (recorder.isRecording) {
                          recorder.stopRecording();
                        } else {
                          recorder.startRecording();
                        }
                      }}
                      startIcon={recorder.isRecording ? <StopIcon /> : <MicIcon />}
                    >
                      {recorder.isRecording ? i18n._("Stop") : i18n._("Record Message")}
                    </Button>

                    <Stack
                      sx={{
                        width: "100%",
                        minWidth: "100px",
                        maxWidth: "100px",
                        height: "38px",
                      }}
                    >
                      {recorder.visualizerComponent}
                    </Stack>
                  </Stack>

                  <Button
                    variant="contained"
                    color="info"
                    disabled={
                      !recorder.transcription || recorder.isTranscribing || recorder.isRecording
                    }
                    onClick={() => submitTranscription()}
                    sx={{
                      width: "calc(100% - 100px)",
                    }}
                    endIcon={<SendIcon />}
                  >
                    {i18n._("Send Message")}
                  </Button>
                </Stack>
              </Stack>
            )}

            <FeatureBlocker onLimitedClick={onLimitedClick} />
            <Button
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
