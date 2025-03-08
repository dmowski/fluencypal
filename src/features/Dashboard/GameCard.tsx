import { Button, Stack, Typography } from "@mui/material";
import { TaskCard } from "./TaskCard";
import { Origami } from "lucide-react";
import { useAiConversation } from "../Conversation/useAiConversation";
import { DashboardCard } from "../uiKit/Card/DashboardCard";
import { useState } from "react";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { useTextAi } from "../Ai/useTextAi";
import { useSettings } from "../Settings/useSettings";

export const GamesBoard = () => {
  const textAi = useTextAi();
  const settings = useSettings();
  const aiConversation = useAiConversation();

  const [isShowCrocodileInstructions, setIsShowCrocodileInstructions] = useState(false);
  const [loadingWords, setLoadingWords] = useState(false);
  const [wordsToDescribe, setWordsToDescribe] = useState<string[]>([]);
  const [wordsToGuess, setWordsToGuess] = useState<string[]>([]);

  const generateRandomWord = async () => {
    setLoadingWords(true);
    const systemMessage = `You need to generate words to play the game Crocodile. Be creative. Some of them should be simple and some of them should be hard. Return your words with comma separated. For example: "apple, banana, orange"`;
    const response = await textAi.generate({
      systemMessage,
      userMessage: `Generate me 20 words. Be creative and create smart words or phrases. Use ${settings.fullLanguageName} language.`,
      model: "gpt-4o",
    });
    const words = response.split(",");
    const shuffledWords = words.sort(() => Math.random() - 0.5);
    const newWordsToGuess: string[] = [];
    const newWordsToDescribe: string[] = [];
    for (let i = 0; i < words.length; i++) {
      const isWordToGuess = i % 2 === 0;
      if (isWordToGuess) {
        newWordsToGuess.push(shuffledWords[i]);
      } else {
        newWordsToDescribe.push(shuffledWords[i]);
      }
    }
    setWordsToDescribe(newWordsToDescribe);
    setWordsToGuess(newWordsToGuess);

    setLoadingWords(false);
  };

  const onStartGame = () => {
    aiConversation.startConversation({
      mode: "game-guess",
      gameWords: {
        wordsAiToDescribe: wordsToGuess,
        wordsUserToDescribe: wordsToDescribe,
      },
    });
  };

  const onCancel = () => {
    setIsShowCrocodileInstructions(false);
    setWordsToDescribe([]);
    setLoadingWords(false);
  };

  return (
    <DashboardCard>
      <Stack>
        <Typography variant="h2" className="decor-title">
          Games
        </Typography>
        <Typography
          variant="caption"
          sx={{
            opacity: 0.7,
          }}
        >
          Play games to learn faster
        </Typography>
      </Stack>
      <Stack
        sx={{
          flexDirection: "row",
          gap: "20px",
          "@media (max-width: 800px)": {
            flexDirection: "column",
            gap: "10px",
          },
        }}
      >
        <TaskCard
          isDone={false}
          title="Guess the word"
          subTitle="Describe the word/guess the word"
          buttonIcon={<Origami size={"20px"} />}
          buttonText="Play"
          onStart={() => setIsShowCrocodileInstructions(true)}
        />
      </Stack>

      {isShowCrocodileInstructions && (
        <CustomModal isOpen={true} onClose={() => onCancel()}>
          {wordsToDescribe.length > 0 ? (
            <Stack sx={{ gap: "40px" }}>
              <Typography variant="h4" component="h2">
                Your words:
              </Typography>
              <Stack sx={{}}>
                <Typography variant="h4" className="decor-text">
                  {wordsToDescribe.join(", ")}
                </Typography>
              </Stack>

              <Button variant="contained" onClick={() => onStartGame()}>
                I'm ready, let's play
              </Button>
            </Stack>
          ) : (
            <Stack sx={{ gap: "20px" }}>
              <Stack>
                <Typography variant="h4" component="h2">
                  Describe the words... if you can
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.7,
                  }}
                >
                  Rules
                </Typography>
              </Stack>
              <Stack>
                <Typography>1. You will see words or phrase</Typography>
                <Typography>2. You need to describe the words without saying it</Typography>
                <Typography>3. AI should said it exactly like it written</Typography>
              </Stack>
              <Stack
                sx={{
                  flexDirection: "row",
                  width: "100%",
                  justifyContent: "space-between",
                  paddingTop: "20px",
                }}
              >
                <Button
                  variant="contained"
                  disabled={loadingWords}
                  onClick={() => generateRandomWord()}
                >
                  {loadingWords ? "Crafting words..." : "Give me the words"}
                </Button>
              </Stack>
            </Stack>
          )}
        </CustomModal>
      )}
    </DashboardCard>
  );
};
