import { useEffect, useState } from "react";
import { GameQuestionScreenProps } from "./type";
import { useAudioRecorder } from "@/features/Audio/useAudioRecorder";
import { Button, IconButton, Stack, Typography } from "@mui/material";
import { Check, ChevronRight, Languages, Mic, Trash } from "lucide-react";
import { useTranslate } from "@/features/Translation/useTranslate";
import { AudioPlayIcon } from "@/features/Audio/AudioPlayIcon";
import { SummaryRow } from "./SummaryRow";
import { useAuth } from "@/features/Auth/useAuth";
import { useSettings } from "@/features/Settings/useSettings";
import { getWordsFromText } from "@/libs/getWordsFromText";
import { useNativeRecorder } from "@/features/Audio/useNativeRecorder";
import { Trans } from "@lingui/react/macro";

export const ReadTextScreen = ({ question, onSubmitAnswer, onNext }: GameQuestionScreenProps) => {
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const auth = useAuth();
  const settings = useSettings();
  const backupRecorder = useAudioRecorder({
    languageCode: settings.languageCode || "en",
    getAuthToken: auth.getToken,
    isFree: true,
    isGame: true,
  });

  const nativeRecorder = useNativeRecorder({
    lang: settings.languageCode || "en",
  });

  const usersTranscript = nativeRecorder.fullTranscript || backupRecorder.transcription;
  const isRecording = nativeRecorder.isRecording || backupRecorder.isRecording;

  const isPhraseRecorded = (phrase: string) => {
    if (!usersTranscript) return false;
    const phraseWords = getWordsFromText(phrase);
    const usersTranscriptWords = getWordsFromText(usersTranscript);
    const wordsFromPhrase = Object.keys(phraseWords);
    const wordsFromTranscript = Object.keys(usersTranscriptWords);
    return wordsFromPhrase.every((word) => wordsFromTranscript.includes(word));
  };

  const error = nativeRecorder.error || backupRecorder.error;
  const translator = useTranslate();
  useEffect(() => {
    setIsCorrect(null);
    backupRecorder.removeTranscript();
    nativeRecorder.removeTranscript();
  }, [question]);

  const handleAnswerSubmit = async (answer: string) => {
    cancelRecording();

    setIsSubmitting(true);
    const { isCorrect } = await onSubmitAnswer(question.id, answer);
    setIsSubmitting(false);
    setIsCorrect(isCorrect);
  };

  const calculatePercentage = () => {
    const transcriptWords = getWordsFromText(usersTranscript || "");
    const questionWords = getWordsFromText(question.question);
    const questWordsCount = Object.keys(questionWords).length;
    const correctlySpokenWords = Object.keys(transcriptWords).filter((word) => {
      return Object.keys(questionWords).includes(word);
    }).length;
    return Math.round((correctlySpokenWords / questWordsCount) * 100);
  };

  const percentage = calculatePercentage();

  const [isUseNativeRecorder, setIsUseNativeRecorder] = useState(true);

  const startRecording = () => {
    try {
      nativeRecorder.startRecording();
    } catch (error) {
      backupRecorder.removeTranscript();
      backupRecorder.startRecording();
      setIsUseNativeRecorder(false);
      throw error;
    }
  };

  const cancelRecording = () => {
    if (isUseNativeRecorder) {
      nativeRecorder.stopRecording();
    } else {
      backupRecorder.removeTranscript();
      backupRecorder.cancelRecording();
    }
  };

  if (question.type !== "read_text") return <></>;
  return (
    <Stack
      sx={{
        gap: "25px",
        width: "100%",
        alignItems: "center",
        height: "100%",
      }}
    >
      {translator.translateModal}
      <Stack
        className="content"
        sx={{
          maxWidth: "600px",
          width: "100%",
          minHeight: "90vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            padding: "20px 10px 15px 10px",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <Trans>Read the text</Trans>
        </Typography>
        <Stack
          sx={{
            gap: "10px",
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: "20px",
            width: "100%",
            padding: "0px 10px 15px 10px",
            boxSizing: "border-box",
          }}
        >
          <Typography
            variant="h5"
            className="decor-text"
            sx={{
              width: "100%",
            }}
          >
            {question.question.split(" ").map((word, index) => {
              return (
                <span key={index}>
                  <Typography
                    variant="h5"
                    sx={{
                      color: isPhraseRecorded(word) ? "#81e381" : "white",
                      transition: "color 0.3s ease",
                      "&:hover": {
                        textDecoration: "underline",
                        cursor: "pointer",
                      },
                    }}
                    className="decor-text"
                    component={"span"}
                    onClick={() => {
                      if (translator.isTranslateAvailable) {
                        translator.translateWithModal(word);
                      }
                    }}
                  >
                    {word}
                  </Typography>{" "}
                </span>
              );
            })}

            {translator.isTranslateAvailable && (
              <IconButton onClick={() => translator.translateWithModal(question.question)}>
                <Languages size={"16px"} color="#eee" />
              </IconButton>
            )}
            <AudioPlayIcon text={question.question} instructions="Calm and clear" voice={"coral"} />
          </Typography>
          <Stack
            sx={{
              position: "relative",
              width: "100%",
              padding: "10px",
              boxSizing: "border-box",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: "10px",
              backdropFilter: "blur(5px)",
              alignItems: "center",
              justifyContent: "flex-start",
              img: {
                position: "absolute",
                top: "0",
                left: "0",
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "10px",
                zIndex: -1,
              },
              height: "400px",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                width: "100%",
                color: "rgba(255, 255, 255, 1)",
              }}
            >
              {usersTranscript}
            </Typography>
            <img src={question.imageUrl} alt={question.question} />
          </Stack>
        </Stack>
      </Stack>

      <Stack
        sx={{
          position: "fixed",
          bottom: "0px",
          left: "0px",
          right: "0px",
          display: "flex",
          padding: "20px 10px",
          backgroundColor: "rgba(12, 14, 12, .80)",
          backdropFilter: "blur(9px)",
          alignItems: "center",
        }}
      >
        <Stack
          sx={{
            width: "100%",
            gap: "5px",
            maxWidth: "600px",
          }}
        >
          {isSubmitting && (
            <Typography
              variant="caption"
              sx={{
                opacity: 0.7,
                width: "100%",
              }}
            >
              <Trans>Loading...</Trans>
            </Typography>
          )}

          {backupRecorder.isTranscribing && (
            <Typography
              variant="caption"
              sx={{
                opacity: 0.7,
                width: "100%",
              }}
            >
              <Trans>Transcribing...</Trans>
            </Typography>
          )}

          {isRecording && (
            <Stack
              sx={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Stack
                sx={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Check />}
                  disabled={percentage < 70}
                  onClick={() => handleAnswerSubmit(question.question)}
                >
                  <Trans>Done</Trans>
                </Button>
                <Typography variant="body2">{percentage}%</Typography>
              </Stack>

              <IconButton
                onClick={() => {
                  cancelRecording();
                }}
              >
                <Trash size={20} />
              </IconButton>
            </Stack>
          )}

          {isCorrect == null && !isRecording && (
            <Button
              startIcon={<Mic />}
              size="large"
              variant="contained"
              disabled={isCorrect !== null}
              onClick={() => {
                startRecording();
              }}
            >
              <Trans>Turn on microphone</Trans>
            </Button>
          )}

          {error && (
            <Typography
              variant="caption"
              sx={{
                color: "red",
                paddingTop: "10px",
              }}
            >
              <Trans>Error:</Trans>: {error}
            </Typography>
          )}

          {isCorrect !== null && (
            <Stack
              sx={{
                gap: "5px",
                alignItems: "flex-start",
                maxWidth: "600px",
                width: "100%",
              }}
            >
              <Stack
                sx={{
                  width: "100%",
                  paddingBottom: "30px",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: isCorrect ? "#4ADE80" : "#F87171",
                  }}
                >
                  {isCorrect ? <Trans>Correct!</Trans> : <Trans>Incorrect!</Trans>}
                </Typography>
              </Stack>
              <Button
                variant="contained"
                size="large"
                endIcon={<ChevronRight />}
                onClick={() => {
                  setIsCorrect(null);
                  onNext();
                }}
                sx={{
                  width: "100%",
                }}
              >
                <Trans>Next</Trans>
              </Button>
              <SummaryRow />
            </Stack>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};
