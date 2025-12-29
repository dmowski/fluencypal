import { useEffect, useState } from "react";
import { GameQuestionScreenProps } from "./type";
import { useLingui } from "@lingui/react";
import { Button, IconButton, Stack, Typography } from "@mui/material";
import { Check, Delete, Loader, ShieldAlert } from "lucide-react";
import { FinishButton, GameContainer } from "./core";

export const SentenceScreen = ({ question, onSubmitAnswer, onNext }: GameQuestionScreenProps) => {
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
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

  if (question.type !== "sentence") return <></>;
  return (
    <GameContainer>
      <Stack>
        <Typography
          variant="caption"
          sx={{
            padding: "0px 10px 15px 0px",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {i18n._("Form a sentence")}
        </Typography>
        <Stack
          sx={{
            gap: "10px",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <Stack
            sx={{
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: "0 7px",
              padding: "10px",
              width: "100%",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: "10px",
              boxSizing: "border-box",
              minHeight: "70px",
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
          width: "100%",
          gap: "25px",
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

        {isCorrect === null && (
          <Button
            variant="contained"
            size="large"
            endIcon={isSubmitting ? <Loader /> : <Check />}
            disabled={
              isSubmitting ||
              selectedWords.length === 0 ||
              question.options.length !== selectedWords.length
            }
            onClick={() => handleAnswerSubmit(selectedWords.join(" "))}
          >
            {i18n._("Submit answer")}
          </Button>
        )}

        {isCorrect !== null && (
          <FinishButton isCorrect={isCorrect} setIsCorrect={setIsCorrect} onNext={onNext} />
        )}
      </Stack>
    </GameContainer>
  );
};
