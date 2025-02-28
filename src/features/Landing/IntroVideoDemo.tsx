import { Button, Stack, Typography } from "@mui/material";
import { subTitleFontSize } from "./landingSettings";

export const IntroVideoDemo = () => {
  return (
    <Stack
      sx={{
        width: "100%",
        padding: "100px 0",
        alignItems: "center",
        justifyContent: "center",
        gap: "100px",
        color: "#000",
        backgroundColor: `rgb(255, 253, 249, 1)`,
        position: "relative",
        zIndex: 1,
        overflow: "hidden",
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
            Speak, Learn, and Grow with Ease
          </Typography>
          <Typography
            align="center"
            variant="body1"
            sx={{
              maxWidth: "810px",
              fontSize: subTitleFontSize,
            }}
          >
            Dark Lang provides an AI-powered language tutor that helps you practice realistic
            conversations in English, Spanish, French, and more. Enjoy casual chats, get instant
            corrections, and track your progress—all with a friendly teacher who never tires.
          </Typography>
        </Stack>

        <Stack
          sx={{
            maxWidth: "1000px",
          }}
        >
          <video
            style={{
              borderRadius: "12px",
            }}
            src="/intro.mp4"
            loop
            autoPlay
            muted
            playsInline
            width="100%"
            height="auto"
          />
        </Stack>
        <Stack
          sx={{
            flexDirection: "row",
            gap: "10px",
            alignItems: "center",
            color: "rgb(43 35 88)",
          }}
        >
          <Button
            sx={{
              padding: "15px 80px",
              borderWidth: "2px",
            }}
            variant="outlined"
            size="large"
            color="inherit"
            href={"/practice"}
          >
            {"Get started free"}
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};
