import { Button, Stack, Typography } from "@mui/material";
import { GameQuestionShort, GameQuestionType } from "./types";
import { useEffect, useState } from "react";
import { Check, ChevronRight } from "lucide-react";
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
  useEffect(() => {
    setSelectedAnswer(null);
    setIsCorrect(null);
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
        <Typography variant="h4" className="decor-text">
          {question.question}
        </Typography>
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
      </Stack>

      {isCorrect !== null ? (
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
      ) : (
        <Button
          disabled={!selectedAnswer || isSubmitting}
          variant="contained"
          onClick={async (e) => {
            handleAnswerSubmit(selectedAnswer || "");
          }}
        >
          {isSubmitting ? "Loading" : "Submit"}
        </Button>
      )}
    </Stack>
  );
};
