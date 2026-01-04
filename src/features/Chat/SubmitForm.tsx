"use client";
import { IconButton, Stack, Typography, Button } from "@mui/material";
import { useLingui } from "@lingui/react";
import { useAudioRecorder } from "../Audio/useAudioRecorder";
import SendIcon from "@mui/icons-material/Send";
import StopIcon from "@mui/icons-material/Stop";
import MicIcon from "@mui/icons-material/Mic";
import { CHAT_MESSAGE_POINTS } from "./data";
import { Trash } from "lucide-react";

interface SubmitFormProps {
  onSubmit: (message: string) => Promise<void>;
  isLoading: boolean;
  recordMessageTitle: string;
}

export function SubmitForm({ onSubmit, isLoading, recordMessageTitle }: SubmitFormProps) {
  const { i18n } = useLingui();

  const recorder = useAudioRecorder({
    visualizerComponentWidth: "100%",
  });

  const submitTranscription = async () => {
    await onSubmit(recorder.transcription || "");
    recorder.removeTranscript();
    recorder.cancelRecording();
  };

  const needMoreText = !!recorder?.transcription?.length && recorder.transcription.length < 4;

  if (isLoading) {
    return <Typography>{i18n._("Loading...")}</Typography>;
  }
  return (
    <Stack
      sx={{
        width: "100%",
        padding: "0px",
        gap: "20px",
        alignItems: "flex-start",
      }}
    >
      {recorder.transcription && (
        <Stack>
          <Stack>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              {i18n._("Transcription:")}
            </Typography>
          </Stack>
          <Stack
            sx={{
              gap: "5px",
              flexDirection: "row",
            }}
          >
            <Typography
              variant="body1"
              className={`${recorder.isTranscribing ? "loading-shimmer" : ""}`}
              sx={{
                opacity: !recorder.transcription ? 0.5 : 1,
              }}
            >
              {recorder.transcription}
            </Typography>
            {recorder.transcription && (
              <IconButton size="small" onClick={() => recorder.removeTranscript()}>
                <Trash size={"14px"} />
              </IconButton>
            )}
          </Stack>
        </Stack>
      )}
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
          {(!recorder.transcription || recorder.isTranscribing || recorder.isRecording) && (
            <Button
              disabled={recorder.isTranscribing}
              variant={"contained"}
              color={recorder.isRecording ? "error" : "info"}
              sx={{
                width: "100%",
              }}
              size="large"
              onClick={() => {
                if (recorder.isRecording) {
                  recorder.stopRecording();
                } else {
                  recorder.startRecording();
                }
              }}
              startIcon={recorder.isRecording ? <StopIcon /> : <MicIcon />}
            >
              {recorder.isRecording ? i18n._("Stop") : recordMessageTitle}
            </Button>
          )}

          {recorder.transcription && (
            <Button
              variant="contained"
              color="info"
              disabled={needMoreText || recorder.isTranscribing || recorder.isRecording}
              onClick={() => submitTranscription()}
              sx={{
                width: "calc(100% - 200px)",
              }}
              endIcon={<SendIcon />}
            >
              {i18n._("Send Message")}
            </Button>
          )}

          <Stack
            sx={{
              width: "100%",
              height: "38px",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
            }}
          >
            <Stack
              sx={{
                height: "100%",
                width: recorder.isRecording ? "100%" : "0",
              }}
            >
              {recorder.visualizerComponent}
            </Stack>

            {!recorder.isRecording && (
              <Typography
                sx={{
                  width: "100%",
                  paddingLeft: "10px",
                  opacity: 0.8,
                }}
                variant="caption"
                color={needMoreText ? "#ff8e86ff" : "textSecondary"}
              >
                {needMoreText
                  ? i18n._(`Please record a longer message (at least a few words).`)
                  : i18n._(`Record a message and get {points} points`, {
                      points: CHAT_MESSAGE_POINTS,
                    })}
              </Typography>
            )}
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}
