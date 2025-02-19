import { TalkingWaves } from "@/features/Animations/TalkingWaves";
import { Button, Link, Stack, Typography } from "@mui/material";
import { Header } from "../Header/Header";
import Galaxy from "./Galaxy";
import { StarContainer } from "../Layout/StarContainer";

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
            position: "relative",
            zIndex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <StarContainer minHeight="100vh" paddingBottom="230px">
            <img
              src="/cross.png"
              alt=""
              style={{
                width: "18px",
                height: "81px",
                opacity: "0.5",
              }}
            />

            <Stack
              alignItems={"center"}
              sx={{
                position: "relative",
                zIndex: 9999,
                gap: "20px",
              }}
            >
              <img
                src="./logo.svg"
                alt="Online English Learning"
                style={{
                  height: "auto",
                  width: "500px",
                  maxWidth: "90vw",
                  opacity: 0.92,
                }}
              />
              <Typography
                sx={{
                  fontWeight: "100",
                  textTransform: "uppercase",
                }}
              >
                AI Teacher for Learning English
              </Typography>
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
                Get a free lesson
              </Button>
              <Stack
                sx={{
                  flexDirection: "row",
                  gap: "10px",
                  alignItems: "center",
                }}
              >
                <Typography variant="caption">No credit card needed</Typography>
              </Stack>
            </Stack>
          </StarContainer>

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

              animation: "fadeInGalaxy 1s ease-in-out 0.6s forwards",
              "@keyframes fadeInGalaxy": {
                "0%": { opacity: 0 },
                "100%": { opacity: 0.4 },
              },
            }}
          >
            <Galaxy />
          </Stack>
        </Stack>
      </main>
    </>
  );
}
