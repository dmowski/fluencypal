import { Stack, Typography } from "@mui/material";
import { FirstEnterButton } from "./FirstEnterButton";
import { GradientCard } from "../uiKit/Card/GradientCard";
import { maxLandingWidth, subTitleFontStyle } from "./landingSettings";

export const WelcomeScreen = () => {
  return (
    <Stack
      sx={{
        maxWidth: maxLandingWidth,
        padding: "150px 10px 80px 10px",
        minHeight: "calc(100vh - 20px)",
        boxSizing: "border-box",
        alignItems: "center",
        justifyContent: "center",
        gap: "100px",
        "@media (max-width: 600px)": {
          gap: "20px",
        },
      }}
    >
      <Stack
        sx={{
          alignItems: "center",
          gap: "50px",
        }}
      >
        <Stack
          sx={{
            gap: "20px",
            alignItems: "center",
          }}
        >
          <a
            href={"/"}
            style={{
              padding: "20px 20px 20px 0",
            }}
          >
            <img src="./logo.svg" alt="Dark lang logo" width="90px" height="42px" />
          </a>
          <Typography
            align="center"
            variant="h1"
            component={"h1"}
            sx={{
              fontWeight: 700,
              "@media (max-width: 1300px)": {
                fontSize: "4rem",
              },
              "@media (max-width: 900px)": {
                fontSize: "3rem",
              },
              "@media (max-width: 700px)": {
                fontSize: "2rem",
              },
            }}
          >
            Online English with AI Teacher
          </Typography>
          <Typography
            align="center"
            variant="body1"
            sx={{
              maxWidth: "940px",
              ...subTitleFontStyle,
            }}
          >
            Experience next-level language practice with Bruno, your friendly AI tutor who’s ready
            to chat 24/7. Whether you’re a beginner or advanced learner, Bruno adapts to your pace,
            corrects mistakes, and keeps you motivated.
          </Typography>
        </Stack>

        <Stack
          sx={{
            flexDirection: "row",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <FirstEnterButton showPricingButton />
        </Stack>
      </Stack>

      <GradientCard
        padding="3vw"
        strokeWidth="1vw"
        startColor={"#fa8500"}
        endColor={"#05acff"}
        backgroundColor={"rgba(10, 18, 30, 1)"}
      >
        <img
          src="/dashboard.jpg"
          alt="dashboard"
          style={{ width: "100%", height: "auto", aspectRatio: "1862 / 1706" }}
        />
      </GradientCard>
    </Stack>
  );
};
