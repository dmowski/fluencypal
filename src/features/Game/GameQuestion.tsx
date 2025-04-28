import { Button, Stack, Typography } from "@mui/material";
import { GameQuestionShort } from "./types";
import { useEffect, useState } from "react";

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
          {question.type}
        </Typography>
        <Typography variant="h4" className="decor-text">
          {question.question}
        </Typography>
        <Stack
          sx={{
            flexDirection: "row",
            gap: "10px",
            paddingTop: "10px",
          }}
        >
          {question.options.map((answer, index) => {
            return (
              <Stack key={index} sx={{}}>
                <Button
                  variant={selectedAnswer === answer ? "contained" : "outlined"}
                  onClick={() => setSelectedAnswer(answer)}
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
          <Typography>{isCorrect ? "Correct!" : "Incorrect!"}</Typography>
          <Button
            variant="outlined"
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
