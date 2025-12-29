import { useEffect, useState } from "react";
import { GameQuestionScreenProps } from "./type";
import { useAudioRecorder } from "@/features/Audio/useAudioRecorder";
import { useLingui } from "@lingui/react";
import { Button, IconButton, Stack, TextField, Typography } from "@mui/material";
import { Check, ChevronLast, Languages, Loader, Mic, Trash } from "lucide-react";
import { useTranslate } from "@/features/Translation/useTranslate";
import { Markdown } from "@/features/uiKit/Markdown/Markdown";
import { AudioPlayIcon } from "@/features/Audio/AudioPlayIcon";
import { useAuth } from "@/features/Auth/useAuth";
import { useSettings } from "@/features/Settings/useSettings";
import { StringDiff } from "react-string-diff";
import { FinishButton, GameContainer, SkipButton } from "./core";
import { useGame } from "../useGame";

export const DescribeImageScreen = ({ onSubmitAnswer }: GameQuestionScreenProps) => {
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [textAnswer, setTextAnswer] = useState<string>("");
  const [answerDescription, setAnswerDescription] = useState<string | null>(null);
  const [answerCorrectedMessage, setAnswerCorrectedMessage] = useState<string | null>(null);

  const auth = useAuth();
  const game = useGame();
  const settings = useSettings();
  const recorder = useAudioRecorder({
    languageCode: settings.languageCode || "en",
    getAuthToken: auth.getToken,
    isFree: false,
    isGame: true,
  });
  const [isUseMicrophone, setIsUseMicrophone] = useState<boolean>(false);
  const translator = useTranslate();

  const question = game.activeQuestion;

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
    const { isCorrect, description } = await onSubmitAnswer(question?.id || "", answer);

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

  if (question?.type !== "describe_image") return <></>;
  return (
    <GameContainer>
      {translator.translateModal}
      <Stack
        sx={{
          width: "100%",
          gap: "10px",
        }}
      >
        <Typography variant="caption">{i18n._("Describe the image")}</Typography>
        <Stack
          sx={{
            gap: "10px",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img src={question.imageUrl} style={{ width: "100%", objectFit: "cover" }} />
        </Stack>
      </Stack>

      <Stack
        sx={{
          width: "100%",
          gap: "5px",
          maxWidth: "600px",
        }}
      >
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
              endIcon={isSubmitting ? <Loader /> : <Check />}
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
              <Stack
                sx={{
                  flexDirection: "row",
                  gap: "10px",
                  alignItems: "center",
                }}
              >
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
                  {i18n._("Record")}
                </Button>
                <SkipButton disabled={isCorrect !== null} />
              </Stack>
            )}
          </Stack>
        )}

        {!recorder.transcription &&
          !recorder.isTranscribing &&
          !isUseMicrophone &&
          isCorrect === null && (
            <Stack
              sx={{
                alignItems: "flex-start",
                gap: "10px",
              }}
            >
              <TextField
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder={i18n._("Describe the image")}
                fullWidth
                disabled={isSubmitting || isCorrect !== null}
              />
              <Stack
                sx={{
                  flexDirection: "row",
                  width: "100%",
                  gap: "10px",
                }}
              >
                <Button
                  disabled={isSubmitting || textAnswer.length < 3}
                  onClick={() => handleAnswerSubmit(textAnswer)}
                  variant="contained"
                  endIcon={isSubmitting ? <Loader /> : <Check />}
                >
                  {i18n._("Submit answer")}
                </Button>
                <Button
                  endIcon={<ChevronLast />}
                  size="large"
                  variant="text"
                  disabled={isCorrect !== null || isSubmitting}
                  onClick={game.nextQuestion}
                >
                  {i18n._("Skip")}
                </Button>
              </Stack>
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
                    oldValue={answerDescription || ""}
                    newValue={answerCorrectedMessage}
                  />

                  <Stack
                    sx={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: "0px",
                    }}
                  >
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
            <FinishButton isCorrect={isCorrect} setIsCorrect={setIsCorrect} />
          </Stack>
        )}
      </Stack>
    </GameContainer>
  );
};
