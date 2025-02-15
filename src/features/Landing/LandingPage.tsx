import { TalkingWaves } from "@/features/Animations/TalkingWaves";
import { Button, Stack, Typography } from "@mui/material";
import { Header } from "../Header/Header";

export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <TalkingWaves />
        <Stack
          sx={{
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "10",
            paddingTop: "20px",
            minHeight: "90vh",
          }}
        >
          <Stack
            sx={{
              alignItems: "center",
              justifyContent: "center",
              paddingBottom: "220px",
              gap: "30px",
              top: "90px",
              boxSizing: "border-box",
              left: 0,
              right: 0,
              bottom: 0,
              height: "700px",
              width: "700px",
              backgroundImage: "url('./star.webp')",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "contain",
              zIndex: 1,
              opacity: 0,

              animation: "fadeIn 2s ease-in-out 0s forwards",
              "@keyframes fadeIn": {
                "0%": { opacity: 0 },
                "100%": { opacity: 1 },
              },
            }}
          >
            <img
              src="/cross.png"
              alt=""
              style={{
                width: "18px",
                opacity: "0.5",
              }}
            />

            <Stack alignItems={"center"} gap={"10px"}>
              <img
                src="./logo.png"
                alt="logo"
                style={{
                  animationDelay: "0.5s",
                  height: "auto",
                  width: "400px",
                  maxWidth: "90vw",
                }}
              />
              <Typography>AI TEACHER TO LEARN ENGLISH</Typography>
            </Stack>
            <Button
              sx={{
                padding: "15px 30px",
              }}
              variant="contained"
              size="large"
              href={"/practice"}
            >
              START
            </Button>
          </Stack>
        </Stack>
      </main>
    </>
  );
}
