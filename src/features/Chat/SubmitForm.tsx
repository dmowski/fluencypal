"use client";
import { Stack, Typography, Button, IconButton } from "@mui/material";
import { useLingui } from "@lingui/react";
import { useAudioRecorder } from "../Audio/useAudioRecorder";
import SendIcon from "@mui/icons-material/Send";
import StopIcon from "@mui/icons-material/Stop";
import MicIcon from "@mui/icons-material/Mic";
import { CHAT_MESSAGE_POINTS } from "./data";
import { useEffect, useState } from "react";
import { ProcessUserInput } from "../Conversation/ProcessUserInput";
import { Mic, Trash } from "lucide-react";
import { GamePlusPoints } from "../Game/gameQuestionScreens/gameCoreUI";

interface SubmitFormProps {
  onSubmit: (message: string) => Promise<void>;
  isLoading: boolean;
  recordMessageTitle: string;
  setIsActiveRecording: (isRecording: boolean) => void;
  previousBotMessage: string;
}

export function SubmitForm({
  onSubmit,
  isLoading,
  recordMessageTitle,
  setIsActiveRecording,
  previousBotMessage,
}: SubmitFormProps) {
  const { i18n } = useLingui();

  const recorder = useAudioRecorder({
    visualizerComponentWidth: "100%",
  });

  const submitTranscription = async () => {
    await onSubmit(recorder.transcription || "");
    recorder.removeTranscript();
    recorder.cancelRecording();
  };

  useEffect(() => {
    if (setIsActiveRecording) {
      setIsActiveRecording(recorder.isRecording);
    }
  }, [recorder.isRecording, setIsActiveRecording]);

  const needMoreText = !!recorder?.transcription?.length && recorder.transcription.length < 4;

  const [isAnalyzingMessageWithAi, setIsAnalyzingMessageWithAi] = useState(false);
  const isAnalyzingResponse = isAnalyzingMessageWithAi || recorder.isTranscribing;

  if (isLoading) return <Typography>{i18n._("Loading...")}</Typography>;

  return (
    <Stack
      sx={{
        width: "100%",
        gap: "20px",
        alignItems: "flex-start",
        padding: "15px",
      }}
    >
      {(recorder.transcription || recorder.isTranscribing || isAnalyzingResponse) && (
        <Stack
          sx={{
            flexDirection: "row",
            width: "100%",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <ProcessUserInput
            isTranscribing={recorder.isTranscribing}
            userMessage={recorder.transcription || ""}
            setIsAnalyzing={setIsAnalyzingMessageWithAi}
            setIsNeedCorrection={() => {}}
            previousBotMessage={previousBotMessage}
          />
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

          {recorder.transcription && !recorder.isRecording && !recorder.isTranscribing && (
            <Stack
              sx={{
                flexDirection: "row",
                gap: "10px",
                width: "calc(100% - 0px)",
              }}
            >
              <Button
                variant="outlined"
                color="info"
                disabled={needMoreText || recorder.isTranscribing || recorder.isRecording}
                onClick={async () => {
                  recorder.startRecording();
                }}
                fullWidth
                endIcon={<Mic />}
              >
                {i18n._("Re-record")}
              </Button>

              <Button
                variant="contained"
                color="info"
                disabled={needMoreText || recorder.isTranscribing || recorder.isRecording}
                onClick={() => submitTranscription()}
                fullWidth
                endIcon={<SendIcon />}
              >
                {i18n._("Send Message")}
              </Button>
            </Stack>
          )}

          <Stack
            sx={{
              width: recorder.isRecording ? "100%" : "max-content",
              height: "38px",
              alignItems: "center",
              justifyContent: "flex-end",
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

            {!recorder.isRecording && !recorder.transcription && (
              <Stack
                sx={{
                  width: "100%",
                  paddingLeft: "10px",
                }}
              >
                <GamePlusPoints points={CHAT_MESSAGE_POINTS} />
              </Stack>
            )}

            {recorder.transcription && (
              <Stack
                sx={{
                  width: "100%",
                  paddingLeft: "20px",
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => {
                    recorder.removeTranscript();
                    recorder.cancelRecording();
                  }}
                >
                  <Trash size={"18px"} color="rgba(200, 200, 200, 1)" />
                </IconButton>
              </Stack>
            )}
          </Stack>
        </Stack>
        {recorder.transcription && needMoreText && (
          <>
            <Typography
              sx={{
                width: "100%",
                paddingLeft: "10px",
                opacity: 0.8,
              }}
              variant="caption"
              color={"#ff8e86ff"}
            >
              {i18n._(`Please record a longer message (at least a few words).`)}
            </Typography>
          </>
        )}
      </Stack>
    </Stack>
  );
}
