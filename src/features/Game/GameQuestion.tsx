import { Button, IconButton, Stack, TextField, Typography } from "@mui/material";
import { GameQuestionShort, GameQuestionType } from "./types";
import { useEffect, useState } from "react";
import { Check, CheckCheck, ChevronRight, Delete, Mic, ShieldAlert } from "lucide-react";
import { useLingui } from "@lingui/react";
import { useGame } from "./useGame";
import { useAudioRecorder } from "../Audio/useAudioRecorder";

interface GameQuestionProps {
  question: GameQuestionShort;
  onSubmitAnswer: (
    questionId: string,
    answer: string
  ) => Promise<{ isCorrect: boolean; description: string | null }>;
  onNext: () => void;
}

export const GameQuestion = ({ question, onSubmitAnswer, onNext }: GameQuestionProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const game = useGame();
  const [textAnswer, setTextAnswer] = useState<string>("");
  const [answerDescription, setAnswerDescription] = useState<string | null>(null);
  const recorder = useAudioRecorder();
  const [isUseMicrophone, setIsUseMicrophone] = useState<boolean>(false);
  useEffect(() => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    setSelectedWords([]);
    setTextAnswer("");
    setAnswerDescription(null);
    recorder.removeTranscript();
    setIsUseMicrophone(Math.random() > 0.3);
  }, [question]);

  const handleAnswerSubmit = async (answer: string) => {
    setIsSubmitting(true);
    const { isCorrect, description } = await onSubmitAnswer(question.id, answer);
    setIsSubmitting(false);
    setAnswerDescription(description || null);
    setIsCorrect(isCorrect);
  };

  const { i18n } = useLingui();

  const labelMap: Record<GameQuestionType, string> = {
    translate: i18n._("Translate"),
    sentence: i18n._("Craft a sentence"),
    describe_image: i18n._("Describe the image"),
  };

  const gameLabel = labelMap[question.type];

  return (
    <Stack
      sx={{
        gap: "25px",
      }}
    >
      <Stack>
        <Typography
          variant="caption"
          sx={{
            paddingBottom: "35px",
          }}
        >
          {gameLabel}
        </Typography>

        {question.type === "describe_image" && (
          <>
            <Stack
              sx={{
                gap: "10px",
                alignItems: "center",
                justifyContent: "center",
                paddingBottom: "20px",
              }}
            >
              <img src={question.imageUrl} style={{ width: "100%", objectFit: "cover" }} />
              <Stack
                sx={{
                  flexDirection: "row",
                  alignItems: "center",
                  width: "100%",
                  gap: "10px",
                  boxSizing: "border-box",
                }}
              >
                {isUseMicrophone ? (
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
                          onClick={() => recorder.stopRecording()}
                        >
                          {i18n._(`Stop recording`)}
                        </Button>
                      </>
                    ) : (
                      <Button
                        startIcon={<Mic />}
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

                    {recorder.visualizerComponent}
                  </Stack>
                ) : (
                  <>
                    <TextField
                      value={textAnswer}
                      onChange={(e) => setTextAnswer(e.target.value)}
                      placeholder={i18n._("Describe the image")}
                      fullWidth
                      disabled={isSubmitting || isCorrect !== null}
                    />
                    <IconButton
                      disabled={isSubmitting || textAnswer.length < 3}
                      onClick={() => handleAnswerSubmit(textAnswer)}
                    >
                      <Check />
                    </IconButton>
                  </>
                )}
              </Stack>

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

              {recorder.isTranscribing && (
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.7,
                  }}
                >
                  {i18n._(`Transcribing...`)}
                </Typography>
              )}
              {recorder.transcription && (
                <Stack
                  sx={{
                    width: "100%",
                    paddingTop: "10px",
                    gap: "10px",
                    alignItems: "flex-start",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      paddingTop: "10px",
                      opacity: 0.7,
                      width: "100%",
                    }}
                  >
                    {i18n._("Transcription:") + " " + recorder.transcription}
                  </Typography>

                  <Button
                    variant="contained"
                    disabled={
                      isCorrect !== null ||
                      isSubmitting ||
                      recorder.isRecording ||
                      !recorder?.transcription ||
                      recorder.transcription.length < 3
                    }
                    onClick={() => handleAnswerSubmit(recorder?.transcription || "")}
                  >
                    {i18n._("Submit answer")}
                  </Button>
                </Stack>
              )}

              {isSubmitting && (
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.7,
                  }}
                >
                  {i18n._(`Loading...`)}
                </Typography>
              )}
              {isCorrect !== null && (
                <Stack
                  sx={{
                    width: "100%",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: isCorrect ? "#4ADE80" : "#F87171",
                    }}
                  >
                    {isCorrect ? i18n._("Correct!") : i18n._("Incorrect!")}
                  </Typography>
                  <Typography>{answerDescription}</Typography>
                </Stack>
              )}
            </Stack>
          </>
        )}

        {question.type === "translate" && (
          <>
            <Typography variant="h4" className="decor-text">
              {question.question}
            </Typography>

            <Stack>
              <Stack
                sx={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: "10px",
                  paddingTop: "10px",
                }}
              >
                {question.options.map((answer, index) => {
                  const isCorrectOption =
                    question.type === "translate" && isCorrect && selectedAnswer === answer;

                  const isInCorrectOption =
                    question.type === "translate" &&
                    isCorrect === false &&
                    selectedAnswer === answer;

                  return (
                    <Stack key={index} sx={{}}>
                      <Button
                        variant={selectedAnswer === answer ? "contained" : "outlined"}
                        startIcon={isCorrectOption ? <Check /> : undefined}
                        color={
                          isCorrectOption ? "success" : isInCorrectOption ? "error" : "primary"
                        }
                        onClick={() => {
                          if (isCorrect !== null) {
                            return;
                          }
                          setSelectedAnswer(answer);
                          handleAnswerSubmit(answer);
                        }}
                      >
                        {answer}
                      </Button>
                    </Stack>
                  );
                })}
              </Stack>
              {isSubmitting && (
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.7,
                  }}
                >
                  {i18n._(`Loading...`)}
                </Typography>
              )}
            </Stack>
          </>
        )}

        {question.type === "sentence" && (
          <>
            <Stack
              sx={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: "10px",
                paddingTop: "10px",
              }}
            >
              {question.options.map((answer, index) => {
                const isSelected = selectedWords.includes(answer);

                return (
                  <Stack key={index} sx={{}}>
                    <Button
                      disabled={isSelected}
                      variant={"outlined"}
                      onClick={() => {
                        if (isCorrect !== null) {
                          return;
                        }
                        setSelectedWords((prev) => {
                          if (prev.includes(answer)) {
                            return prev.filter((word) => word !== answer);
                          }
                          return [...prev, answer];
                        });
                      }}
                      sx={{
                        textTransform: "none",
                      }}
                    >
                      {answer}
                    </Button>
                  </Stack>
                );
              })}
            </Stack>

            <Stack
              sx={{
                flexDirection: "row",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "0 7px",
                paddingTop: "12px",
              }}
            >
              {question.options
                .filter((answer) => selectedWords.includes(answer))
                .map((answer, index) => {
                  const word = selectedWords[index] || "";

                  return (
                    <Stack
                      key={index}
                      sx={{
                        padding: "0px",
                        borderRadius: "3px",
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          color: isCorrect ? "#4ADE80" : isCorrect === false ? "#F87171" : "#fff",
                        }}
                      >
                        {word}
                      </Typography>
                    </Stack>
                  );
                })}

              {isCorrect === true && <Check size={"18px"} color="#4ADE80" />}
              {isCorrect === false && <ShieldAlert size={"18px"} color="#F87171" />}

              {selectedWords.length > 0 && isCorrect === null && (
                <IconButton
                  size="small"
                  disabled={selectedWords.length === 0}
                  onClick={() => {
                    setSelectedWords((prev) => {
                      const newWords = [...prev];
                      newWords.pop();
                      return newWords;
                    });
                  }}
                >
                  <Delete size={"15px"} />
                </IconButton>
              )}
            </Stack>
          </>
        )}
      </Stack>

      {isCorrect !== null && (
        <Stack
          sx={{
            gap: "10px",
            alignItems: "flex-start",
          }}
        >
          <Button
            variant="contained"
            endIcon={<ChevronRight />}
            onClick={() => {
              setIsCorrect(null);
              onNext();
            }}
            sx={{
              width: "100%",
            }}
          >
            Next
          </Button>
          {game.myPosition && (
            <Typography variant="body2">
              {i18n._(`My Position:`)} {game.myPosition}
            </Typography>
          )}
        </Stack>
      )}

      {isCorrect === null && question.type === "sentence" && (
        <Button
          disabled={selectedWords.length !== question.options.length || isSubmitting}
          variant="contained"
          onClick={async (e) => {
            handleAnswerSubmit(selectedWords.join(" "));
          }}
        >
          {isSubmitting ? "Loading" : "Submit"}
        </Button>
      )}
    </Stack>
  );
};
