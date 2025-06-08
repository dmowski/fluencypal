import { useEffect, useState } from "react";
import { GameQuestionScreenProps } from "./type";
import { useGame } from "../useGame";
import { useLingui } from "@lingui/react";
import { Button, IconButton, Stack, Typography } from "@mui/material";
import { Check, ChevronRight, Delete, ShieldAlert } from "lucide-react";

export const SentenceScreen = ({ question, onSubmitAnswer, onNext }: GameQuestionScreenProps) => {
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const game = useGame();
  useEffect(() => {
    setIsCorrect(null);
    setSelectedWords([]);
  }, [question]);

  const handleAnswerSubmit = async (answer: string) => {
    setIsSubmitting(true);
    const { isCorrect } = await onSubmitAnswer(question.id, answer);
    setIsSubmitting(false);
    setIsCorrect(isCorrect);
  };

  const { i18n } = useLingui();

  if (question.type !== "sentence") {
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
          }}
        >
          {i18n._("Form a sentence")}
        </Typography>
        <Stack
          sx={{
            gap: "10px",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <Stack
            sx={{
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              gap: "0 7px",
              padding: "10px",
            }}
          >
            {selectedWords.map((word, index) => {
              return (
                <Stack
                  key={index}
                  sx={{
                    padding: "0px",
                    borderRadius: "3px",
                  }}
                >
                  <Typography
                    variant="h4"
                    className="decor-text"
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
              {i18n._(`Loading...`)}
            </Typography>
          )}

          {isCorrect === null && (
            <Stack
              sx={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: "10px",
                paddingTop: "10px",
              }}
            >
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
            </Stack>
          )}

          {question.options.length === selectedWords.length && isCorrect === null && (
            <Button
              variant="contained"
              size="large"
              endIcon={<Check />}
              disabled={isSubmitting || selectedWords.length === 0}
              onClick={() => {
                handleAnswerSubmit(selectedWords.join(" "));
              }}
            >
              {i18n._("Submit answer")}
            </Button>
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
                  {isCorrect ? i18n._("Correct!") : i18n._("Incorrect!")}
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
                Next
              </Button>
              <Typography variant="body2">
                {i18n._(`My Position:`)} {game.myPosition}
              </Typography>
            </Stack>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};
