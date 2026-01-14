import CallEndIcon from "@mui/icons-material/CallEnd";
import MicOffIcon from "@mui/icons-material/MicOff";
import MicIcon from "@mui/icons-material/Mic";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import { Button, CircularProgress, IconButton, Stack, Typography } from "@mui/material";
import { useLingui } from "@lingui/react";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import { CircleQuestionMark, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { CustomModal } from "@/features/uiKit/Modal/CustomModal";
import { FeatureBlocker } from "@/features/Usage/FeatureBlocker";
import { useAudioRecorder } from "@/features/Audio/useAudioRecorder";
import SendIcon from "@mui/icons-material/Send";
import StopIcon from "@mui/icons-material/Stop";
import ClosedCaptionIcon from "@mui/icons-material/ClosedCaption";
import ClosedCaptionDisabledIcon from "@mui/icons-material/ClosedCaptionDisabled";
import { LessonPlanAnalysis } from "@/features/LessonPlan/type";
import { sleep } from "@/libs/sleep";
import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";

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

  isSubtitlesEnabled,
  toggleSubtitles,

  lessonPlanAnalysis,
  onShowAnalyzeConversationModal,
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

  isSubtitlesEnabled: boolean;
  toggleSubtitles: (isToggleOn: boolean) => void;

  lessonPlanAnalysis: LessonPlanAnalysis | null;
  onShowAnalyzeConversationModal: () => void;
}) => {
  const { i18n } = useLingui();

  const progress = lessonPlanAnalysis?.progress || 1;

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

  const recorder = useAudioRecorder();

  const submitTranscription = () => {
    onSubmitTranscription(recorder.transcription || "");
    recorder.removeTranscript();
    recorder.cancelRecording();
    setIsShowMuteWarning(false);
  };

  const [isRecordingByButton, setIsRecordingByButton] = useState(false);
  const [previousIsVolumeOn, setPreviousIsVolumeOn] = useState(isVolumeOn);

  useEffect(() => {
    if (!isRecordingByButton) {
      setPreviousIsVolumeOn(isVolumeOn);
    }
  }, [isRecordingByButton, isVolumeOn]);

  const onDoneRecordingUsingButton = async () => {
    if (recorder.isTranscribing) return;
    recorder.stopRecording();
  };

  const startRecordingUsingButton = async () => {
    if (recorder.isTranscribing) return;
    setIsRecordingByButton(true);
    setIsVolumeOn(false);

    await sleep(20); // wait for state to update
    await recorder.startRecording();
  };

  const cancelRecordingUsingButton = () => {
    if (recorder.isTranscribing) return;
    setIsVolumeOn(previousIsVolumeOn);
    recorder.cancelRecording();
    setIsRecordingByButton(false);
  };

  useEffect(() => {
    if (!isRecordingByButton) return;
    if (!recorder.transcription) return;

    submitTranscription();

    setTimeout(() => {
      setIsRecordingByButton(false);
    }, 200);
  }, [isRecordingByButton, recorder.transcription]);

  return (
    <Stack
      sx={{
        backgroundColor: "rgba(10, 18, 30, 1)",
        borderRadius: "20px 20px 0 0 ",
        boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.3)",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        width: "max-content",
        padding: "10px 10px 21px 10px",
        position: "relative",
        bottom: progress > 99 ? "80px" : "-1px",
      }}
    >
      <Stack
        sx={{
          position: "absolute",
          bottom: "0px",
          left: "0px",
          width: "calc(100% - 0px)",
          height: "9px",
          borderRadius: "0",
          overflow: "hidden",
          opacity: lessonPlanAnalysis ? 1 : 0,
        }}
      >
        <Stack
          sx={{
            width: `${progress}%`,
            height: "100%",
            position: "absolute",
            top: 0,
            left: "0px",
            background: "linear-gradient(90deg, rgba(46, 193, 233, 1), rgba(0, 166, 255, 1))",
            transition: "width 0.3s ease-in-out",
          }}
        />
      </Stack>

      {progress > 99 ? (
        <Stack
          sx={{
            alignItems: "center",
            gap: "10px",
            padding: "10px 20px",
          }}
        >
          <Typography>{i18n._("Mission complete")}</Typography>
          <Button
            startIcon={<Trophy />}
            size="large"
            color="info"
            variant="contained"
            onClick={onShowAnalyzeConversationModal}
          >
            {i18n._("Open results")}
          </Button>
        </Stack>
      ) : (
        <>
          {isRecordingByButton ? (
            <>
              <CallButton
                activeButton={
                  recorder.isTranscribing ? <CircularProgress size={"24px"} /> : <DoneIcon />
                }
                inactiveButton={
                  recorder.isTranscribing ? <CircularProgress size={"24px"} /> : <DoneIcon />
                }
                isActive={recorder.isTranscribing}
                label={i18n._("Done recording")}
                onClick={onDoneRecordingUsingButton}
              />

              <Stack
                sx={{
                  width: "185px",
                }}
              >
                {recorder.Visualizer}
              </Stack>

              <CallButton
                activeButton={
                  recorder.isTranscribing ? <CloseIcon style={{ opacity: 0.2 }} /> : <CloseIcon />
                }
                inactiveButton={
                  recorder.isTranscribing ? <CloseIcon style={{ opacity: 0.2 }} /> : <CloseIcon />
                }
                isActive={true}
                label={i18n._("Cancel recording")}
                onClick={cancelRecordingUsingButton}
              />
            </>
          ) : (
            <>
              <CallButton
                activeButton={<MicIcon />}
                inactiveButton={<MicOffIcon />}
                isActive={false}
                label={i18n._("Record message")}
                onClick={startRecordingUsingButton}
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
                activeButton={<ClosedCaptionIcon />}
                inactiveButton={<ClosedCaptionDisabledIcon />}
                isActive={isSubtitlesEnabled}
                label={
                  isSubtitlesEnabled ? i18n._("Turn off subtitles") : i18n._("Turn on subtitles")
                }
                onClick={() => toggleSubtitles(!isSubtitlesEnabled)}
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
            </>
          )}

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
                  maxWidth: "600px",
                  gap: "40px",
                  alignItems: "center",
                  paddingTop: "25px",
                }}
              >
                <Stack
                  sx={{
                    maxWidth: "600px",
                    gap: "0px",
                  }}
                >
                  <Typography variant="h5">
                    {isShowVolumeWarning ? i18n._("AI voice") : i18n._("Real-time conversation")}
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
                          {recorder.Visualizer}
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
        </>
      )}
    </Stack>
  );
};
