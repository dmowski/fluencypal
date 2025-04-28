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
          <Typography>Questions:</Typography>

          <Stack
            sx={{
              gap: "60px",
            }}
          >
            {game.questions.map((question, index) => {
              return (
                <Stack
                  key={index}
                  sx={{
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    padding: "20px",
                    borderRadius: "10px",
                    gap: "5px",
                  }}
                >
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
    </Stack>
  );
};
