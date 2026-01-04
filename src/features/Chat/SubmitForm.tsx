"use client";
import { IconButton, Stack, Typography, Button } from "@mui/material";
import { useLingui } from "@lingui/react";
import { useAudioRecorder } from "../Audio/useAudioRecorder";
import SendIcon from "@mui/icons-material/Send";
import StopIcon from "@mui/icons-material/Stop";
import MicIcon from "@mui/icons-material/Mic";
import { CHAT_MESSAGE_POINTS } from "./data";
import { useEffect, useRef, useState } from "react";
import { RecordAiInfo } from "../Conversation/ConversationCanvas";
import { useCorrections } from "../Corrections/useCorrections";
import { useTranslate } from "../Translation/useTranslate";

interface SubmitFormProps {
  onSubmit: (message: string) => Promise<void>;
  isLoading: boolean;
  recordMessageTitle: string;
}

export function SubmitForm({ onSubmit, isLoading, recordMessageTitle }: SubmitFormProps) {
  const { i18n } = useLingui();

  const [isNeedToShowCorrection, setIsNeedToShowCorrection] = useState<boolean>(false);

  const recorder = useAudioRecorder({
    visualizerComponentWidth: "100%",
  });

  const submitTranscription = async () => {
    await onSubmit(recorder.transcription || "");
    recorder.removeTranscript();
    recorder.cancelRecording();
  };

  const needMoreText = !!recorder?.transcription?.length && recorder.transcription.length < 4;

  const transcription = recorder.transcription;

  const messageAnalyzing = useRef("");

  const [isAnalyzingMessageWithAi, setIsAnalyzingMessageWithAi] = useState(false);
  const [description, setDescription] = useState<string | null>(null);
  const [correctedMessage, setCorrectedMessage] = useState<string | null>(null);
  const corrections = useCorrections();
  const [isAnalyzingError, setIsAnalyzingError] = useState(false);

  const analyzeUserInput = async (usersNewMessage: string) => {
    messageAnalyzing.current = usersNewMessage;

    setIsAnalyzingMessageWithAi(true);
    setIsNeedToShowCorrection(false);
    setDescription(null);
    setCorrectedMessage(null);

    try {
      const userMessage = usersNewMessage;
      const previousBotMessage = "";

      const { sourceMessage, correctedMessage, description } = await corrections.analyzeUserMessage(
        {
          previousBotMessage,
          message: userMessage,
          conversationId: "chat",
        }
      );
      if (usersNewMessage !== sourceMessage) {
        return;
      }

      const isBad =
        !!description &&
        !!correctedMessage?.trim() &&
        correctedMessage.toLowerCase().trim() !== sourceMessage.toLowerCase().trim();
      setIsNeedToShowCorrection(isBad);

      setCorrectedMessage(isBad ? correctedMessage || null : null);
      setDescription(isBad ? description || null : null);
      setIsAnalyzingMessageWithAi(false);
    } catch (error) {
      console.error("Error during analyzing message", error);
      setIsAnalyzingError(true);
      setIsAnalyzingMessageWithAi(false);
      throw error;
    }
  };

  useEffect(() => {
    if (recorder.transcription) {
      analyzeUserInput(recorder.transcription);
    }
  }, [recorder.transcription]);

  const translator = useTranslate();
  const isAnalyzingResponse = isAnalyzingMessageWithAi || recorder.isTranscribing;

  if (isLoading) return <Typography>{i18n._("Loading...")}</Typography>;

  return (
    <Stack
      sx={{
        width: "100%",
        gap: "20px",
        alignItems: "flex-start",
        backgroundColor: "rgba(20, 28, 40, 0.9)",
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
          <RecordAiInfo
            isTranscribing={recorder.isTranscribing}
            confirmedUserInput={transcription || ""}
            isAnalyzingResponse={isAnalyzingResponse}
            isNeedToShowCorrection={isNeedToShowCorrection}
            translateWithModal={translator.translateWithModal}
            description={description || ""}
            correctedMessage={correctedMessage || ""}
            isAnalyzingError={isAnalyzingError}
          />
        </Stack>
      )}
      {translator.translateModal}
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
          {(!transcription || recorder.isTranscribing || recorder.isRecording) && (
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

          {transcription && (
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
                onClick={() => {
                  recorder.startRecording();
                }}
                fullWidth
                endIcon={<SendIcon />}
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

            {transcription && needMoreText && (
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

            {!recorder.isRecording && !transcription && (
              <Typography
                sx={{
                  width: "100%",
                  paddingLeft: "10px",
                  opacity: 0.8,
                }}
                variant="caption"
                color={"textSecondary"}
              >
                {i18n._(`Record a message and get {points} points`, {
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
