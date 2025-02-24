import { Button, Stack, Typography } from "@mui/material";
import { GradientCard } from "../uiKit/Card/GradientCard";

export const Price = () => {
  const startColor = "#fa8500";
  const endColor = "#05acff";
  return (
    <Stack
      sx={{
        width: "100%",
        alignItems: "center",
        justifyContent: "center",

        marginTop: "30px",
        position: "relative",
        zIndex: 1,
        padding: "30px",
        boxSizing: "border-box",
      }}
    >
      <Stack
        sx={{
          maxWidth: "600px",
        }}
      >
        <GradientCard
          padding="50px 80px"
          strokeWidth={"4px"}
          startColor={startColor}
          endColor={endColor}
        >
          <Stack
            sx={{
              width: "100%",
              gap: "20px",
            }}
          >
            <Stack>
              <Typography variant="h2" align="center">
                Pay as you go
              </Typography>

              <Typography align="center" variant="caption" sx={{ opacity: 0.8 }}>
                First lesson is free, then you can buy as many hours as want
              </Typography>
            </Stack>

            <Stack>
              <Typography align="center" variant="h3">
                $5
              </Typography>
              <Typography align="center" variant="caption">
                For an hour lesson
              </Typography>
            </Stack>

            <Stack>
              <Button variant="contained" size="large" href="/practice">
                Start for free
              </Button>
              <Typography
                align="center"
                variant="caption"
                sx={{
                  opacity: 0.9,
                }}
              >
                No card required
              </Typography>
            </Stack>
          </Stack>
        </GradientCard>
      </Stack>
    </Stack>
  );
};
