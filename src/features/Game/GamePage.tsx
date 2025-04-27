import { Button, Stack, Typography } from "@mui/material";
import { useGame } from "./useGame";

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
          maxWidth: "1400px",
          padding: "10px",
          paddingTop: "80px",
          boxSizing: "border-box",
          gap: "70px",
          position: "relative",
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
          <Typography variant="caption">Username: {game.myProfile?.username || "-"}</Typography>
        </Stack>

        <Stack>
          <Typography variant="caption">Stats:</Typography>

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
          <Typography variant="caption">Questions:</Typography>

          {game.questions.map((question, index) => {
            return (
              <Stack key={index}>
                <Typography>Question - {question.question}</Typography>
                <Stack
                  sx={{
                    flexDirection: "row",
                    gap: "10px",
                  }}
                >
                  {question.options.map((answer, index) => {
                    return (
                      <Stack key={index} sx={{}}>
                        <Button variant="outlined">{answer}</Button>
                      </Stack>
                    );
                  })}
                </Stack>
              </Stack>
            );
          })}
        </Stack>
      </Stack>
    </Stack>
  );
};
