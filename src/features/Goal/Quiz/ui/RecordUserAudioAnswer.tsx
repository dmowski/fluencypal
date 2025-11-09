"use client";
import { Button, IconButton, Stack, Typography } from "@mui/material";

import { useLingui } from "@lingui/react";
import { Check, Goal, Mic, Trash } from "lucide-react";
import { ReactNode } from "react";
import { Trans } from "@lingui/react/macro";
import { getWordsCount } from "@/libs/words";

export const RecordUserAudioAnswer = ({
  transcript,
  minWords,
  isLoading,
  isTranscribing,
  visualizerComponent,
  isRecording,
  stopRecording,
  startRecording,
  clearTranscript,
  error,
}: {
  transcript: string;
  minWords: number;
  isLoading?: boolean;
  isTranscribing: boolean;
  visualizerComponent: ReactNode;
  isRecording: boolean;
  stopRecording: () => Promise<void>;
  startRecording: () => Promise<void>;
  clearTranscript: () => void;
  error: string | null;
}) => {
  const { i18n } = useLingui();
  const wordsCount = getWordsCount(transcript || "");
  const isNeedMoreRecording = !transcript || wordsCount < minWords;
  return (
    <Stack
      sx={{
        width: "100%",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        padding: "12px 12px 15px 10px",
        borderRadius: "8px",
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        opacity: isLoading ? 0.4 : 1,
      }}
      className={isLoading ? "loading-shimmer-shape" : ""}
    >
      <Stack
        sx={{
          flexDirection: "row",
          width: "100%",
          justifyContent: "space-between",
          paddingBottom: "14px",
          flexWrap: "wrap",
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
          }}
        >
          {i18n._("Your answer")}
        </Typography>

        <Typography
          variant="caption"
          sx={{
            color: wordsCount === 0 ? "inherit" : wordsCount < minWords ? "#FFA500" : "#4CAF50",
          }}
        >
          {wordsCount > 0 ? (
            <>
              {wordsCount} / <b>{minWords}</b>
            </>
          ) : (
            <></>
          )}
        </Typography>
      </Stack>

      <Typography
        variant={transcript ? "body2" : "caption"}
        sx={{
          opacity: transcript ? 1 : 0.8,
        }}
        className={isTranscribing ? `loading-shimmer` : ""}
      >
        {transcript && transcript}

        {isTranscribing && " " + i18n._("Processing...")}
      </Typography>

      {error && (
        <Typography color="error" variant="caption" sx={{ paddingTop: "6px", minHeight: "18px" }}>
          {i18n._("Error:")} {error}
        </Typography>
      )}

      {!transcript && !isTranscribing && (
        <Stack
          sx={{
            alignItems: "center",
            gap: "10px",
            //color: "#888",
            paddingBottom: "10px",
          }}
        >
          <Goal size={"39px"} color="#999" strokeWidth={"2px"} />
          <Typography variant="h6" align="center" sx={{}}>
            <Trans>
              Goal: at least <b>{minWords}</b> words
            </Trans>
          </Typography>
        </Stack>
      )}

      {transcript && !isTranscribing && (
        <Stack>
          {!isNeedMoreRecording && visualizerComponent}
          <Stack
            sx={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: "12px",
              gap: "10px",
            }}
          >
            {wordsCount >= minWords && (
              <Button
                variant={isNeedMoreRecording ? "contained" : "outlined"}
                endIcon={isRecording ? <Check /> : <Mic size={"16px"} />}
                size="small"
                color={isRecording ? "error" : "primary"}
                onClick={() => {
                  if (isRecording) {
                    stopRecording();
                  } else {
                    startRecording();
                  }
                }}
              >
                {isRecording ? i18n._("Done") : i18n._("Record more")}
              </Button>
            )}
            <IconButton size="small" onClick={clearTranscript}>
              <Trash size={"16px"} />
            </IconButton>
          </Stack>
        </Stack>
      )}
    </Stack>
  );
};
