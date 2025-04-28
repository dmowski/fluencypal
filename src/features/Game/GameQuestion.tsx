import { Button, IconButton, Stack, Typography } from "@mui/material";
import { GameQuestionShort, GameQuestionType } from "./types";
import { useEffect, useState } from "react";
import { Check, ChevronRight, Delete, ShieldAlert } from "lucide-react";
import { useLingui } from "@lingui/react";

interface GameQuestionProps {
  question: GameQuestionShort;
  onSubmitAnswer: (questionId: string, answer: string) => Promise<boolean>;
  onNext: () => void;
}

export const GameQuestion = ({ question, onSubmitAnswer, onNext }: GameQuestionProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);

  useEffect(() => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    setSelectedWords([]);
  }, [question]);

  const handleAnswerSubmit = async (answer: string) => {
    setIsSubmitting(true);
    const isCorrect = await onSubmitAnswer(question.id, answer);
    setIsSubmitting(false);
    setIsCorrect(isCorrect);
  };

  const { i18n } = useLingui();

  const labelMap: Record<GameQuestionType, string> = {
    translate: i18n._("Translate"),
    sentence: i18n._("Craft a sentence"),
  };

  const gameLabel = labelMap[question.type];

  return (
    <Stack
      sx={{
        border: "1px solid rgba(255, 255, 255, 0.1)",
        padding: "20px",
        borderRadius: "10px",
        gap: "25px",
      }}
    >
      <Stack>
        <Typography
          variant="caption"
          sx={{
            textTransform: "uppercase",
          }}
        >
          {gameLabel}
        </Typography>
        {question.type === "translate" && (
          <Typography variant="h4" className="decor-text">
            {question.question}
          </Typography>
        )}

        {question.type === "sentence" && (
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
                  >
                    {answer}
                  </Button>
                </Stack>
              );
            })}
          </Stack>
        )}

        {question.type === "sentence" && (
          <Stack
            sx={{
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "7px",
              paddingTop: "10px",
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
                      backgroundColor: "rgba(255, 255, 255, 0.01)",
                      padding: "5px 0px",
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
        )}

        {question.type === "translate" && (
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
                      if (question.type === "translate") {
                        handleAnswerSubmit(answer);
                      }
                    }}
                  >
                    {answer}
                  </Button>
                </Stack>
              );
            })}
          </Stack>
        )}
      </Stack>

      {isCorrect !== null && (
        <>
          <Button
            variant="contained"
            endIcon={<ChevronRight />}
            onClick={() => {
              setIsCorrect(null);
              onNext();
            }}
          >
            Next
          </Button>
        </>
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
