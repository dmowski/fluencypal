import { Stack, Typography } from "@mui/material";

export const GamePage = () => {
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
      </Stack>
    </Stack>
  );
};
