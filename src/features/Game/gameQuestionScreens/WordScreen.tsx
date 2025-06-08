import { useEffect, useState } from "react";
import { GameQuestionScreenProps } from "./type";
import { useGame } from "../useGame";
import { useLingui } from "@lingui/react";
import { Button, Stack, Typography } from "@mui/material";
import { Check, ChevronRight } from "lucide-react";

export const WordScreen = ({ question, onSubmitAnswer, onNext }: GameQuestionScreenProps) => {
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const game = useGame();
  useEffect(() => {
    setIsCorrect(null);
    setSelectedAnswer(null);
  }, [question]);

  const handleAnswerSubmit = async (answer: string) => {
    setIsSubmitting(true);
    const { isCorrect } = await onSubmitAnswer(question.id, answer);
    setIsSubmitting(false);
    setIsCorrect(isCorrect);
  };

  const { i18n } = useLingui();

  if (question.type !== "translate") {
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
          {i18n._("Translate the word")}
        </Typography>
        <Stack
          sx={{
            gap: "10px",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontSize: "2.5rem",
            }}
            className="decor-text"
          >
            {question.question}
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
                question.type === "translate" && isCorrect === false && selectedAnswer === answer;

              return (
                <Stack key={index} sx={{}}>
                  <Button
                    variant={selectedAnswer === answer ? "contained" : "outlined"}
                    startIcon={isCorrectOption ? <Check /> : undefined}
                    color={isCorrectOption ? "success" : isInCorrectOption ? "error" : "primary"}
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
