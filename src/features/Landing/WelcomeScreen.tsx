import { Stack, Typography } from "@mui/material";
import { FirstEnterButton } from "./FirstEnterButton";
import { GradientCard } from "../uiKit/Card/GradientCard";

export const WelcomeScreen = () => {
  return (
    <Stack
      sx={{
        maxWidth: "1200px",
        padding: "150px 10px 80px 10px",
        minHeight: "calc(100vh - 20px)",
        boxSizing: "border-box",
        alignItems: "center",
        justifyContent: "center",
        gap: "100px",
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
            maxWidth: "890px",
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
            <img
              src="./logo.svg"
              alt="Dark lang logo"
              style={{
                maxWidth: "90px",
                height: "auto",
              }}
            />
          </a>
          <Typography
            align="center"
            variant="h2"
            component={"h1"}
            sx={{
              fontWeight: 700,
            }}
          >
            Online English with AI Teacher
          </Typography>
          <Typography
            align="center"
            variant="body1"
            sx={{
              maxWidth: "810px",
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
          <FirstEnterButton />
        </Stack>
      </Stack>

      <GradientCard
        padding="42px"
        strokeWidth="12px"
        startColor={"#fa8500"}
        endColor={"#05acff"}
        backgroundColor={"rgba(10, 18, 30, 1)"}
      >
        <img src="/dashboard.png" alt="dashboard" style={{ width: "100%" }} />
      </GradientCard>
    </Stack>
  );
};
