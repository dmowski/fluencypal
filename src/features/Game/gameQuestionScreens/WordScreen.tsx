import { useEffect, useState } from "react";
import { GameQuestionScreenProps } from "./type";
import { Button, Stack, Typography } from "@mui/material";
import { Check, Loader } from "lucide-react";
import { FinishButton, TaskTitle } from "./gameCoreUI";
import { useGame } from "../useGame";

export const WordScreen = ({}: GameQuestionScreenProps) => {
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const game = useGame();
  const question = game.activeQuestion;

  useEffect(() => {
    setIsCorrect(null);
    setSelectedAnswer(null);
  }, [question]);

  const handleAnswerSubmit = async (answer: string) => {
    setIsSubmitting(true);
    const { isCorrect } = await game.submitAnswer(question?.id || "", answer);
    setIsSubmitting(false);
    setIsCorrect(isCorrect);
  };

  if (question?.type !== "translate") return <></>;
  return (
    <Stack
      sx={{
        gap: "25px",
        maxWidth: "600px",
        width: "100%",
        padding: "0px 10px",
      }}
    >
      <Stack
        sx={{
          gap: "10px",
        }}
      >
        <TaskTitle />

        <Typography
          variant="h4"
          sx={{
            fontSize: "2.5rem",
            width: "100%",
          }}
          className="decor-text"
        >
          {question.question}
        </Typography>
      </Stack>

      <Stack
        sx={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: "10px",
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
                startIcon={
                  isCorrectOption ? (
                    <Check />
                  ) : isSubmitting && selectedAnswer === answer ? (
                    <Loader />
                  ) : null
                }
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

      <Stack
        sx={{
          width: "100%",
          gap: "5px",
        }}
      >
        {isCorrect !== null && <FinishButton isCorrect={isCorrect} setIsCorrect={setIsCorrect} />}
      </Stack>
    </Stack>
  );
};
