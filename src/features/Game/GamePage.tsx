import { Button, Stack, Typography } from "@mui/material";
import { useGame } from "./useGame";
import { LangSelector } from "../Lang/LangSelector";
import { GameQuestion } from "./GameQuestion";

export const GamePage = () => {
  const game = useGame();
  return (
    <Stack
      sx={{
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: "90px",
      }}
    >
      <Stack
        sx={{
          width: "100%",
          maxWidth: "1000px",
          padding: "10px",
          paddingTop: "80px",
          boxSizing: "border-box",
          gap: "20px",
          position: "relative",
          alignItems: "flex-start",
          zIndex: 1,
          "@media (max-width: 850px)": {
            paddingLeft: "0",
            paddingRight: "0",
          },
        }}
      >
        <Typography variant="h4" align="center" className="decor-text">
          Game
        </Typography>
        <Stack>
          <Typography variant="caption">
            Your Username: {game.myProfile?.username || "-"}
          </Typography>
        </Stack>

        <Stack
          sx={{
            gap: "5px",
            width: "250px",
          }}
        >
          <Typography variant="body2">Your Native Language:</Typography>
          <LangSelector
            value={game.nativeLanguageCode || "en"}
            onChange={(lang) => game.setNativeLanguageCode(lang)}
          />
        </Stack>

        <Stack>
          <Typography>Stats:</Typography>

          {game.stats.map((stat, index) => {
            return (
              <Stack key={index}>
                <Typography variant="caption">
                  {stat.username}: {stat.points} p
                </Typography>
              </Stack>
            );
          })}
        </Stack>
        <Button
          variant="contained"
          onClick={game.generateQuestions}
          disabled={game.loadingQuestions}
        >
          {game.loadingQuestions ? `Loading` : `Play`}
        </Button>

        <Stack
          sx={{
            gap: "20px",
          }}
        >
          {game.activeQuestion && (
            <GameQuestion
              question={game.activeQuestion}
              onNext={game.nextQuestion}
              onSubmitAnswer={game.submitAnswer}
            />
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};
