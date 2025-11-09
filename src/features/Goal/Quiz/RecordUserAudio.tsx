"use client";

import { Stack, Typography } from "@mui/material";
import { useLingui } from "@lingui/react";
import { ArrowRight, Check, Mic } from "lucide-react";
import { useQuiz } from "./useQuiz";
import { ReactNode, useEffect } from "react";
import { useAudioRecorder } from "@/features/Audio/useAudioRecorder";
import { useAuth } from "@/features/Auth/useAuth";
import { getWordsCount } from "@/libs/words";
import { FooterButton } from "./ui/FooterButton";
import { RecordUserAudioAnswer } from "./ui/RecordUserAudioAnswer";

export const RecordUserAudio = ({
  transcript,
  minWords,
  updateTranscript,
  title,
  subTitle,
  subTitleComponent,
  isLoading,
}: {
  transcript: string;
  minWords: number;
  updateTranscript: (transcript: string) => Promise<void>;
  title: string;
  subTitle: string | ReactNode;
  subTitleComponent: ReactNode;
  isLoading?: boolean;
}) => {
  const { i18n } = useLingui();
  const { languageToLearn, nextStep } = useQuiz();

  const auth = useAuth();

  const recorder = useAudioRecorder({
    languageCode: languageToLearn || "en",
    getAuthToken: auth.getToken,
    isFree: false,
    isGame: false,
    visualizerComponentWidth: "100%",
  });

  useEffect(() => {
    if (recorder.transcription) {
      const combinedTranscript = [transcript, recorder.transcription].filter(Boolean).join(" ");
      updateTranscript(combinedTranscript);
    }
  }, [recorder.transcription]);

  const clearTranscript = () => {
    if (transcript) {
      updateTranscript("");
    }
  };

  const wordsCount = getWordsCount(transcript || "");
  const isNeedMoreRecording = !transcript || wordsCount < minWords;

  return (
    <Stack
      sx={{
        gap: "0px",
      }}
    >
      <Stack
        sx={{
          gap: "10px",
          padding: "0 10px",
        }}
      >
        <Stack
          sx={{
            gap: "15px",
          }}
        >
          <Stack>
            <Typography variant="h6" className={isLoading ? "loading-shimmer" : ""}>
              {title}
            </Typography>
            <Typography
              variant="caption"
              className={isLoading ? "loading-shimmer" : ""}
              sx={{
                opacity: 0.8,
              }}
            >
              {subTitle}
            </Typography>
          </Stack>
          <Stack>{subTitleComponent}</Stack>
          <RecordUserAudioAnswer
            transcript={transcript}
            minWords={minWords}
            isLoading={isLoading}
            isTranscribing={recorder.isTranscribing}
            visualizerComponent={recorder.visualizerComponent}
            isRecording={recorder.isRecording}
            stopRecording={recorder.stopRecording}
            startRecording={recorder.startRecording}
            clearTranscript={clearTranscript}
            error={recorder.error}
          />
        </Stack>
      </Stack>

      <FooterButton
        aboveButtonComponent={isNeedMoreRecording && recorder.visualizerComponent}
        disabled={
          isLoading || (recorder.isRecording && wordsCount >= minWords) || recorder.isTranscribing
        }
        onClick={async () => {
          if (transcript && wordsCount >= minWords) {
            if (recorder.isRecording) {
              await recorder.stopRecording();
            }
            nextStep();
            return;
          }

          if (recorder.isRecording) {
            recorder.stopRecording();
            return;
          }

          recorder.startRecording();
        }}
        title={
          recorder.isRecording && wordsCount < minWords
            ? i18n._("Done")
            : transcript && wordsCount >= minWords
            ? i18n._("Next")
            : i18n._("Record")
        }
        color={
          recorder.isRecording && wordsCount < minWords
            ? "error"
            : wordsCount > minWords
            ? "success"
            : "primary"
        }
        endIcon={
          recorder.isRecording && wordsCount < minWords ? (
            <Check />
          ) : transcript && wordsCount >= minWords ? (
            <ArrowRight />
          ) : (
            <Mic />
          )
        }
      />
    </Stack>
  );
};
