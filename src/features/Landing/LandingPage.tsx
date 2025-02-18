import { TalkingWaves } from "@/features/Animations/TalkingWaves";
import { Button, Link, Stack, Typography } from "@mui/material";
import { Header } from "../Header/Header";
import Galaxy from "./Galaxy";

export default function LandingPage() {
  return (
    <>
      <Header />
      <main
        style={{
          width: "100%",
          margin: 0,
        }}
      >
        <TalkingWaves />
        <Stack
          sx={{
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "10",
            paddingTop: "0px",
            minHeight: "80vh",
            position: "relative",
            zIndex: 222,
          }}
        >
          <Stack
            sx={{
              alignItems: "center",
              justifyContent: "center",
              paddingBottom: "100px",
              gap: "30px",
              top: "90px",
              boxSizing: "border-box",
              left: 0,
              right: 0,
              bottom: 0,
              height: "700px",

              width: "700px",
              maxWidth: "100vw",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "contain",
              position: "relative",
              opacity: 0,

              animation: "fadeIn 2s ease-in-out 0s forwards",
              "@keyframes fadeIn": {
                "0%": { opacity: 0 },
                "100%": { opacity: 1 },
              },
            }}
          >
            <Stack
              sx={{
                position: "absolute",
                top: "40px",
                width: "100%",
                height: "100%",
                zIndex: -2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                opacity: 1,
              }}
            >
              <img src="./star.webp" alt="" style={{ width: "100%", minWidth: "700px" }} />
            </Stack>

            <img
              src="/cross.png"
              alt=""
              style={{
                width: "18px",
                opacity: "0.5",
              }}
            />

            <Stack
              alignItems={"center"}
              gap={"10px"}
              sx={{
                position: "relative",
                zIndex: 9999,
              }}
            >
              <img
                src="./logo.svg"
                alt="logo"
                style={{
                  animationDelay: "0.5s",
                  height: "auto",
                  width: "400px",
                  maxWidth: "90vw",
                  opacity: 0.8,
                }}
              />
              <Typography>AI TEACHER TO LEARN LANGUAGES</Typography>
            </Stack>

            <Stack
              sx={{
                alignItems: "center",
                gap: "10px",
                position: "relative",
                zIndex: 9999,
              }}
            >
              <Button
                sx={{
                  padding: "15px 80px",
                }}
                variant="contained"
                size="large"
                href={"/practice"}
              >
                START
              </Button>
              <Stack
                sx={{
                  flexDirection: "row",
                  gap: "10px",
                  alignItems: "center",
                }}
              >
                <Link href="/privacy">
                  <Typography variant="caption">Privacy Policy</Typography>
                </Link>
                <Link href="/terms">
                  <Typography variant="caption">Terms of Use</Typography>
                </Link>
              </Stack>
            </Stack>
          </Stack>
        </Stack>

        <Stack
          sx={{
            width: "100%",
            height: "100vh",
            pointerEvents: "none",
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: -2,
            opacity: 0,

            animation: "fadeInGalaxy 2s ease-in-out 0.4s forwards",
            "@keyframes fadeInGalaxy": {
              "0%": { opacity: 0 },
              "100%": { opacity: 0.4 },
            },
          }}
        >
          <Galaxy />
        </Stack>
      </main>
    </>
  );
}
