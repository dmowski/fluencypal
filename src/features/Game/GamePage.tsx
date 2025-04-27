import { Stack, Typography } from "@mui/material";
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
      </Stack>
    </Stack>
  );
};
