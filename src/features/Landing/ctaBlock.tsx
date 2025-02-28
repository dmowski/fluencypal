import { Button, Stack, Typography } from "@mui/material";
import Galaxy from "../uiKit/Animations/Galaxy";

export const CtaBlock = () => {
  return (
    <Stack
      sx={{
        width: "100%",
        padding: "110px 0 140px 0",
        alignItems: "center",
        justifyContent: "center",
        gap: "100px",
        position: "relative",
        zIndex: 1,
        overflow: "hidden",
        backgroundColor: "#0a121e",
        boxSizing: "border-box",
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
            padding: "0 10px",
          }}
        >
          <Typography
            align="center"
            variant="h3"
            component={"h2"}
            sx={{
              fontWeight: 700,
            }}
          >
            Start Your Journey to Fluent Conversations Now
          </Typography>
        </Stack>
        <Button
          href="/practice"
          variant="contained"
          size="large"
          sx={{
            padding: "15px 40px",
          }}
        >
          Get Started Free
        </Button>
      </Stack>

      <Stack
        sx={{
          width: "100%",
          height: "1300px",
          pointerEvents: "none",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: -2,
          opacity: 0,

          animation: "fadeInGalaxy 1s ease-in-out 0.6s forwards",
          "@keyframes fadeInGalaxy": {
            "0%": { opacity: 0 },
            "100%": { opacity: 0.7 },
          },
        }}
      >
        <Galaxy />
      </Stack>
    </Stack>
  );
};
