import { TalkingWaves } from "@/features/Animations/TalkingWaves";
import { Button, Card, Link, Stack, Typography } from "@mui/material";
import { Header } from "../Header/Header";
import Galaxy from "./Galaxy";
import { StarContainer } from "../Layout/StarContainer";

interface ShortCard {
  title: string;
  description: string;
}

const ShortCard: React.FC<ShortCard> = ({ title, description }) => {
  const startColor = "#05acff";
  const endColor = "#39a5d2";
  return (
    <Stack
      sx={{
        position: "relative",
        width: "100%",
        borderRadius: "18px",
        padding: "18px 20px 15px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "10px",
        backgroundColor: "#070f1a",
        overflow: "hidden",
        zIndex: 0,
        boxSizing: "border-box",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: "18px",
          padding: "2px",
          background: `linear-gradient(135deg, ${startColor}, ${endColor})`,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          zIndex: -1,
        },
      }}
    >
      <Typography
        variant="h6"
        alignItems={"center"}
        sx={{
          fontWeight: "400",
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          opacity: 0.7,
        }}
      >
        {description}
      </Typography>
    </Stack>
  );
};

const Footer = () => {
  return (
    <Stack
      sx={{
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        padding: "50px 0 50px 0",
        backgroundColor: "#070f1a",
        borderTop: "1px solid rgba(0, 0, 0, 1)",
        marginTop: "50px",
        position: "relative",
        zIndex: 9999,
      }}
    >
      <Stack
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          padding: "0 30px",
          boxSizing: "border-box",
          gap: "25px",
          width: "100%",
          justifyContent: "space-between",
          maxWidth: "1100px",
          position: "relative",
          zIndex: 9999,
          "@media (max-width: 800px)": {
            gridTemplateColumns: "1fr",
          },
        }}
      >
        <Stack
          sx={{
            gap: "10px",
          }}
        >
          <img
            src="./logo.svg"
            alt="Online English Learning"
            style={{
              height: "auto",
              width: "80px",
              opacity: 0.92,
            }}
          />
          <Typography variant="caption"></Typography>
        </Stack>
        <Stack
          sx={{
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Link href="/privacy" variant="caption">
            Privacy Policy
          </Link>
          <Link href="/terms" variant="caption">
            Terms of Service
          </Link>
        </Stack>
        <Stack
          sx={{
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <Typography variant="caption">Dark lang</Typography>
          <Typography variant="caption">© 2025</Typography>
        </Stack>
      </Stack>
    </Stack>
  );
};

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
            paddingTop: "5vh",
          }}
        >
          <StarContainer minHeight="80vh" paddingBottom="200px">
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

        <Stack
          sx={{
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Stack
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              padding: "0 30px",
              boxSizing: "border-box",
              gap: "25px",
              width: "100%",
              justifyContent: "space-between",
              maxWidth: "1100px",
              position: "relative",
              zIndex: 9999,
              "@media (max-width: 800px)": {
                gridTemplateColumns: "1fr",
              },
            }}
          >
            <ShortCard
              title="Real-Time Voice Chats"
              description="Speak with our AI tutor for instant feedback. Build confidence through quick, natural dialogues."
            />
            <ShortCard
              title="Daily Tasks"
              description="Practice a short grammar rule, take a quick quiz, and learn a new word. Each task adapts to your level for steady progress."
            />
            <ShortCard
              title="Personalized Homework"
              description="Reinforce new skills with targeted assignments after each session. Practice grammar, vocabulary, and conversation at your pace."
            />
          </Stack>
        </Stack>
      </main>
      <Footer />
    </>
  );
}
