import { useEffect, useState } from "react";
import { GameQuestionScreenProps } from "./type";
import { useAudioRecorder } from "@/features/Audio/useAudioRecorder";
import { useLingui } from "@lingui/react";
import { Button, IconButton, Stack, TextField, Typography } from "@mui/material";
import { Check, ChevronRight, Languages, Mic, Trash, X } from "lucide-react";
import { useTranslate } from "@/features/Translation/useTranslate";
import { Markdown } from "@/features/uiKit/Markdown/Markdown";
import { AudioPlayIcon } from "@/features/Audio/AudioPlayIcon";
import { SummaryRow } from "./SummaryRow";
import { useAuth } from "@/features/Auth/useAuth";
import { useSettings } from "@/features/Settings/useSettings";
import { StringDiff } from "react-string-diff";

export const TopicToDiscussScreen = ({
  question,
  onSubmitAnswer,
  onNext,
}: GameQuestionScreenProps) => {
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [textAnswer, setTextAnswer] = useState<string>("");
  const [answerDescription, setAnswerDescription] = useState<string | null>(null);
  const [answerCorrectedMessage, setAnswerCorrectedMessage] = useState<string | null>(null);

  const auth = useAuth();
  const settings = useSettings();
  const recorder = useAudioRecorder({
    languageCode: settings.languageCode || "en",
    getAuthToken: auth.getToken,
    isFree: true,
    isGame: true,
  });
  const [isUseMicrophone, setIsUseMicrophone] = useState<boolean>(false);
  const translator = useTranslate();
  useEffect(() => {
    setIsCorrect(null);
    setTextAnswer("");
    setAnswerDescription(null);
    setAnswerCorrectedMessage(null);
    recorder.removeTranscript();
    setIsUseMicrophone(Math.random() > 0.1);
  }, [question]);

  const handleAnswerSubmit = async (answer: string) => {
    setIsSubmitting(true);
    const { isCorrect, description } = await onSubmitAnswer(question.id, answer);

    const splitDescription = (description || "").split("|");
    if (splitDescription.length > 1) {
      setAnswerCorrectedMessage(splitDescription[0].trim() || null);
      setAnswerDescription(splitDescription[1].trim() || null);
    } else {
      setAnswerCorrectedMessage(null);
      setAnswerDescription(description || null);
    }

    setIsSubmitting(false);
    setIsCorrect(isCorrect);
  };

  const { i18n } = useLingui();

  if (question.type !== "topic_to_discuss") {
    return <></>;
  }

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
          {i18n._("Discuss the topic")}
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
            variant="h4"
            className="decor-text"
            sx={{
              width: "100%",
            }}
          >
            {question.question}
            {translator.isTranslateAvailable && (
              <IconButton
                onClick={(e) => translator.translateWithModal(question.question, e.currentTarget)}
              >
                <Languages size={"16px"} color="#eee" />
              </IconButton>
            )}
          </Typography>
        </Stack>
      </Stack>

      <Stack
        sx={{
          position: "fixed",
          bottom: "0px",
          left: "0px",
          right: "0px",
          display: "flex",
          padding: "20px 10px 50px 10px",
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
              {i18n._(`Loading...`)}
            </Typography>
          )}

          {recorder.isTranscribing && (
            <Typography
              variant="caption"
              sx={{
                opacity: 0.7,
                width: "100%",
              }}
            >
              {i18n._(`Transcribing...`)}
            </Typography>
          )}

          {recorder.transcription && !answerCorrectedMessage && (
            <Markdown
              onWordClick={
                translator.isTranslateAvailable
                  ? (word, element) => {
                      translator.translateWithModal(word, element);
                    }
                  : undefined
              }
              variant="conversation"
            >
              {recorder.transcription}
            </Markdown>
          )}

          {recorder.transcription && isCorrect === null && (
            <Stack
              sx={{
                flexDirection: "row",
                alignItems: "center",
                width: "100%",
                gap: "10px",
                boxSizing: "border-box",
                justifyContent: "space-between",
              }}
            >
              <Button
                variant="contained"
                disabled={
                  isSubmitting ||
                  recorder.isRecording ||
                  !recorder?.transcription ||
                  recorder.transcription.length < 3
                }
                onClick={() => handleAnswerSubmit(recorder?.transcription || "")}
              >
                {i18n._("Submit answer")}
              </Button>
              <IconButton
                onClick={() => {
                  recorder.removeTranscript();
                  recorder.cancelRecording();
                }}
              >
                <Trash size={20} />
              </IconButton>
            </Stack>
          )}

          {!recorder.transcription && !recorder.isTranscribing && isUseMicrophone && (
            <Stack
              sx={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              {recorder.isRecording ? (
                <>
                  <Button
                    startIcon={<Check />}
                    variant="contained"
                    size="large"
                    onClick={() => recorder.stopRecording()}
                  >
                    {i18n._(`Done`)}
                  </Button>
                  {recorder.visualizerComponent}
                  <IconButton
                    onClick={() => {
                      recorder.cancelRecording();
                      recorder.removeTranscript();
                    }}
                  >
                    <Trash size={20} />
                  </IconButton>
                </>
              ) : (
                <Button
                  startIcon={<Mic />}
                  size="large"
                  variant="contained"
                  disabled={isCorrect !== null}
                  onClick={() => {
                    recorder.removeTranscript();
                    recorder.startRecording();
                  }}
                >
                  {i18n._(`Record an answer`)}
                </Button>
              )}
            </Stack>
          )}

          {!recorder.transcription &&
            !recorder.isTranscribing &&
            !isUseMicrophone &&
            isCorrect === null && (
              <Stack
                sx={{
                  flexDirection: "row",
                  width: "100%",
                  gap: "10px",
                }}
              >
                <TextField
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  placeholder={i18n._("Describe the topic in your own words...")}
                  fullWidth
                  disabled={isSubmitting || isCorrect !== null}
                />
                <IconButton
                  disabled={isSubmitting || textAnswer.length < 3}
                  onClick={() => handleAnswerSubmit(textAnswer)}
                >
                  <Check />
                </IconButton>
              </Stack>
            )}

          {recorder.error && (
            <Typography
              variant="caption"
              sx={{
                color: "red",
                paddingTop: "10px",
              }}
            >
              {i18n._(`Error: `) + recorder.error}
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
                {answerCorrectedMessage && (
                  <Stack
                    sx={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingBottom: "15px",
                      gap: "10px",
                    }}
                  >
                    <StringDiff
                      styles={{
                        added: {
                          color: "#81e381",
                          fontWeight: 600,
                        },
                        removed: {
                          display: "none",
                          textDecoration: "line-through",
                          opacity: 0.4,
                        },
                        default: {},
                      }}
                      oldValue={recorder.transcription || ""}
                      newValue={answerCorrectedMessage}
                    />

                    <IconButton
                      onClick={(e) => {
                        translator.translateWithModal(answerCorrectedMessage, e.currentTarget);
                      }}
                    >
                      <Languages size={"16px"} color="#eee" />
                    </IconButton>
                    <AudioPlayIcon
                      text={answerCorrectedMessage}
                      instructions="Calm and clear"
                      voice={"coral"}
                    />
                  </Stack>
                )}

                {answerDescription && (
                  <Markdown
                    onWordClick={
                      translator.isTranslateAvailable
                        ? (word, element) => {
                            translator.translateWithModal(word, element);
                          }
                        : undefined
                    }
                    variant="conversation"
                  >
                    {answerDescription}
                  </Markdown>
                )}
              </Stack>
              <Button
                variant="contained"
                size="large"
                color={isCorrect ? "success" : "error"}
                startIcon={isCorrect ? <Check /> : <X />}
                endIcon={<ChevronRight />}
                onClick={() => {
                  setIsCorrect(null);
                  onNext();
                }}
                sx={{
                  width: "100%",
                }}
              >
                {i18n._("Next")}
              </Button>
              <SummaryRow />
            </Stack>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};
