import CallEndIcon from "@mui/icons-material/CallEnd";
import MicOffIcon from "@mui/icons-material/MicOff";
import MicIcon from "@mui/icons-material/Mic";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import { Button, CircularProgress, IconButton, Stack, Typography } from "@mui/material";
import { useLingui } from "@lingui/react";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import {
  AudioLines,
  CircleQuestionMark,
  Ear,
  EarOff,
  Loader,
  TextInitial,
  Trophy,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CustomModal } from "@/features/uiKit/Modal/CustomModal";
import { FeatureBlocker } from "@/features/Usage/FeatureBlocker";
import { useAudioRecorder } from "@/features/Audio/useAudioRecorder";
import ClosedCaptionIcon from "@mui/icons-material/ClosedCaption";
import ClosedCaptionDisabledIcon from "@mui/icons-material/ClosedCaptionDisabled";
import { LessonPlanAnalysis } from "@/features/LessonPlan/type";
import { sleep } from "@/libs/sleep";
import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import { useLessonPlan } from "@/features/LessonPlan/useLessonPlan";
import { useVadAudioRecorder } from "@/features/Audio/useVadAudioRecorder";

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

  const toggleVolume = () => {
    if (isLimited) {
      setIsShowVolumeWarning(true);
      return;
    }

    setIsVolumeOn(!isVolumeOn);
    setIsVolumeOnToDisplay(!isVolumeOn);
  };

  const recorder = useAudioRecorder();

  const isSubmittingRef = useRef(false);

  const lessonPlan = useLessonPlan();

  const [isProcessingTranscription, setIsProcessingTranscription] = useState(false);

  const submitTranscription = async () => {
    const transcription = recorder.transcription;
    if (!transcription || isSubmittingRef.current) {
      return;
    }

    isSubmittingRef.current = true;
    setIsProcessingTranscription(true);

    await lessonPlan.generateAnalysis(transcription);

    onSubmitTranscription(transcription);
    recorder.removeTranscript();
    recorder.cancelRecording();

    setIsVolumeOn(isVolumeOnToDisplay);

    setTimeout(() => {
      isSubmittingRef.current = false;
      setIsProcessingTranscription(false);
    }, 200);
  };

  const [isRecordingByButton, setIsRecordingByButton] = useState(false);
  const [isVolumeOnToDisplay, setIsVolumeOnToDisplay] = useState(isVolumeOn);
  useEffect(() => {
    sleep(300).then(() => {
      setIsVolumeOnToDisplay(isVolumeOn);
    });
  }, []);

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
    recorder.cancelRecording();
    setIsRecordingByButton(false);
  };

  useEffect(() => {
    if (!isRecordingByButton) return;
    if (!recorder.transcription) return;

    submitTranscription();
    setIsRecordingByButton(false);
  }, [isRecordingByButton, recorder.transcription]);

  const [transcriptStack, setTranscriptStack] = useState("");
  const transcriptionStackRef = useRef("");
  transcriptionStackRef.current = transcriptStack;

  const vadAudioRecorder = useVadAudioRecorder({
    onTranscription: (transcript: string) => {
      setTranscriptStack((prev) => {
        const newTranscript = prev ? prev + " " + transcript : transcript;
        return newTranscript.trim();
      });
    },
    silenceMs: 800,
  });

  useEffect(() => {
    if (vadAudioRecorder.isSpeaking) {
      setIsVolumeOn(false);
    } else {
      setIsVolumeOn(isVolumeOnToDisplay);
    }
  }, [vadAudioRecorder.isSpeaking]);

  const IS_USE_VAD = true;

  const [isSubmittingVad, setIsSubmittingVad] = useState(false);

  const WAIT_SECOND_BEFORE_SEND = 4;

  const submitVadTranscription = async () => {
    if (!transcriptStack) return;
    setIsSubmittingVad(true);
    const start = Date.now();
    await lessonPlan.generateAnalysis(transcriptStack);
    const end = Date.now();
    const elapsed = end - start;
    if (elapsed < WAIT_SECOND_BEFORE_SEND * 1000) {
      await sleep(WAIT_SECOND_BEFORE_SEND * 1000 - elapsed);
    }
    if (transcriptStack !== transcriptionStackRef.current) {
      return;
    }

    onSubmitTranscription(transcriptStack);
    setTranscriptStack("");
    setIsSubmittingVad(false);
  };

  useEffect(() => {
    submitVadTranscription();
    console.log("transcriptStack", transcriptStack);
  }, [transcriptStack]);

  const [isVadEnabled, setIsVadEnabled] = useState(false);
  const startVad = () => {
    setIsVadEnabled(true);
    vadAudioRecorder.start();
  };

  const stopVad = () => {
    setIsVadEnabled(false);
    vadAudioRecorder.stop();
  };

  const toggleVad = () => {
    if (isVadEnabled) {
      stopVad();
    } else {
      startVad();
    }
  };

  const speakingPercent = Math.max(10, Math.round(vadAudioRecorder.speakingLevel * 100));
  const inActivePercent = 100 - speakingPercent;

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
        bottom: "-1px",
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
        <Button
          startIcon={<Trophy />}
          size="large"
          color="info"
          variant="contained"
          sx={{
            height: "48px",
            minWidth: "250px",
          }}
          onClick={() => {
            stopVad();
            onShowAnalyzeConversationModal();
          }}
        >
          {i18n._("Open results")}
        </Button>
      ) : (
        <>
          {isRecordingByButton || isProcessingTranscription ? (
            <>
              <CallButton
                activeButton={
                  recorder.isTranscribing || isProcessingTranscription ? (
                    <CircularProgress size={"24px"} />
                  ) : (
                    <DoneIcon />
                  )
                }
                inactiveButton={
                  recorder.isTranscribing || isProcessingTranscription ? (
                    <CircularProgress size={"24px"} />
                  ) : (
                    <DoneIcon />
                  )
                }
                isActive={recorder.isTranscribing || isProcessingTranscription}
                label={i18n._("Done recording")}
                onClick={onDoneRecordingUsingButton}
              />

              <Stack
                sx={{
                  width: "185px",
                }}
              >
                {recorder.visualizerComponent}
              </Stack>

              <CallButton
                activeButton={
                  recorder.isTranscribing || isProcessingTranscription ? (
                    <CloseIcon style={{ opacity: 0.2 }} />
                  ) : (
                    <CloseIcon />
                  )
                }
                inactiveButton={
                  recorder.isTranscribing || isProcessingTranscription ? (
                    <CloseIcon style={{ opacity: 0.2 }} />
                  ) : (
                    <CloseIcon />
                  )
                }
                isActive={true}
                label={i18n._("Cancel recording")}
                onClick={cancelRecordingUsingButton}
              />
            </>
          ) : (
            <>
              {IS_USE_VAD ? (
                <CallButton
                  activeButton={
                    <Stack
                      sx={{
                        position: "relative",
                      }}
                    >
                      <MicIcon
                        sx={{
                          fontWeight: "bold",
                          color: "#ff3d3d",
                        }}
                      />

                      <Stack
                        sx={{
                          opacity: vadAudioRecorder.isTranscribing || isSubmittingVad ? 1 : 0,
                          position: "absolute",
                          bottom: "-10px",
                          right: "-10px",
                          height: "14px",
                          width: "14px",
                        }}
                      >
                        <CircularProgress size={"14px"} thickness={8} />
                      </Stack>

                      <Stack
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          overflow: "hidden",
                          height: inActivePercent + "%",
                          width: "100%",
                        }}
                      >
                        <MicIcon
                          sx={{
                            fontWeight: "bold",
                            position: "absolute",
                            top: 0,
                            left: 0,
                            color: "#fff",
                          }}
                        />
                      </Stack>
                    </Stack>
                  }
                  inactiveButton={<MicOffIcon />}
                  isActive={isVadEnabled}
                  label={i18n._("Record Message")}
                  onClick={toggleVad}
                />
              ) : (
                <CallButton
                  activeButton={<MicIcon />}
                  inactiveButton={<MicOffIcon />}
                  isActive={false}
                  label={i18n._("Record Message")}
                  onClick={startRecordingUsingButton}
                />
              )}

              <CallButton
                activeButton={<VolumeUpIcon />}
                inactiveButton={<VolumeOffIcon />}
                isActive={isVolumeOnToDisplay}
                label={isVolumeOnToDisplay ? i18n._("Turn off volume") : i18n._("Turn on volume")}
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
                onClick={() => {
                  vadAudioRecorder.stop();
                  exit();
                }}
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

          {isShowVolumeWarning && (
            <CustomModal
              isOpen={true}
              onClose={() => {
                setIsShowVolumeWarning(false);
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
