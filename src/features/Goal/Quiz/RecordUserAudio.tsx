"use client";

import { Stack, Typography } from "@mui/material";
import { useLingui } from "@lingui/react";
import { ReactNode, useEffect } from "react";
import { useAudioRecorder } from "@/features/Audio/useAudioRecorder";
import { getWordsCount } from "@/libs/words";
import { RecordUserAudioAnswer } from "../../Survey/RecordUserAudioAnswer";
import { ColorIconTextList, ColorIconTextListItem } from "@/features/Survey/ColorIconTextList";
import { InterviewQuizButton } from "./InterviewQuizButton";

export const RecordUserAudio = ({
  transcript,
  minWords,
  maxWords,
  updateTranscript,
  title,
  subTitle,
  subTitleComponent,
  isLoading,
  nextStep,
  listItems,
}: {
  transcript: string;
  minWords: number;
  maxWords?: number;
  updateTranscript: (transcript: string) => Promise<void>;
  title: string;
  subTitle: string | ReactNode;
  subTitleComponent?: ReactNode;
  isLoading?: boolean;
  nextStep: () => void;
  listItems?: ColorIconTextListItem[];
}) => {
  const { i18n } = useLingui();
  const recorder = useAudioRecorder();

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

  const isInLimits = wordsCount >= minWords && (!maxWords || wordsCount <= maxWords);

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
          {(title || subTitle) && (
            <Stack
              sx={{
                width: "100%",
                gap: "5px",
                paddingTop: "40px",
              }}
            >
              {title && (
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 660,
                    lineHeight: "1.2",
                  }}
                >
                  {title}
                </Typography>
              )}
              {subTitle && (
                <Typography
                  variant="body1"
                  sx={{
                    opacity: 0.9,
                    paddingTop: "10px",
                  }}
                >
                  {subTitle}
                </Typography>
              )}
              {!!listItems?.length && (
                <Stack
                  sx={{
                    paddingTop: "10px",
                  }}
                >
                  <ColorIconTextList listItems={listItems} iconSize="18px" gap="10px" />
                </Stack>
              )}
            </Stack>
          )}

          <Stack>{subTitleComponent}</Stack>
          <RecordUserAudioAnswer
            transcript={transcript}
            minWords={minWords}
            maxWords={maxWords}
            isLoading={isLoading}
            isTranscribing={recorder.isTranscribing}
            visualizerComponent={recorder.Visualizer}
            isRecording={recorder.isRecording}
            stopRecording={recorder.stopRecording}
            startRecording={recorder.startRecording}
            clearTranscript={clearTranscript}
            error={recorder.error}
          />
        </Stack>

        <InterviewQuizButton
          onClick={nextStep}
          color={recorder.isRecording && !isInLimits ? "error" : isInLimits ? "success" : "primary"}
          disabled={isLoading || !isInLimits || recorder.isTranscribing}
          title={i18n._("Next")}
        />
      </Stack>
    </Stack>
  );
};
