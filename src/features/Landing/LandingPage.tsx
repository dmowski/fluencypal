import { TalkingWaves } from "@/features/Animations/TalkingWaves";
import { Button, Link, Stack, Typography } from "@mui/material";
import { Header } from "../Header/Header";
import Galaxy from "../Animations/Galaxy";
import { StarContainer } from "../Layout/StarContainer";
import { emojiLanguageName, fullEnglishLanguageName, supportedLanguages } from "@/common/lang";

interface ShortCard {
  title: string;
  description: string;
}

const ShortCard: React.FC<ShortCard> = ({ title, description }) => {
  const startColor = "rgba(5, 172, 255, 0.2)";
  const endColor = "rgba(5, 172, 255, 0.3)";
  return (
    <Stack
      sx={{
        position: "relative",
        width: "100%",
        borderRadius: "18px",
        padding: "22px 35px 24px 25px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "15px",
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
        variant="h5"
        component={"h2"}
        sx={{
          fontWeight: "400",
          width: "100%",
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

const FirsCards = () => {
  return (
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
          maxWidth: "1400px",
          position: "relative",
          zIndex: 1,
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
        borderTop: "4px solid rgba(14, 14, 15, 1)",
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
          "@media (max-width: 900px)": {
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
            "@media (max-width: 900px)": {
              alignItems: "flex-start",
            },
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
            "@media (max-width: 900px)": {
              alignItems: "flex-start",
            },
          }}
        >
          <Typography variant="caption">Dark Lang</Typography>
          <Typography variant="caption">© 2025</Typography>
        </Stack>
      </Stack>
    </Stack>
  );
};

const SupportedLanguages = () => {
  return (
    <Stack
      sx={{
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        padding: "50px 0 80px 0",
        backgroundColor: "#070f1a",
        marginTop: "50px",
        position: "relative",
        zIndex: 1,
        gap: "40px",
      }}
    >
      <Stack
        gap={"5px"}
        sx={{
          padding: "0 30px ",
          boxSizing: "border-box",
        }}
      >
        <Typography variant="h2" align="center">
          Languages
        </Typography>
        <Typography
          variant="body2"
          align="center"
          sx={{
            opacity: 0.8,
          }}
        >
          Learning languages is fun and easy with our AI tutor. Choose from 20+ languages to start
          practicing today.
        </Typography>
      </Stack>
      <Stack
        sx={{
          flexDirection: "row",
          gap: "40px 20px",
          maxWidth: "1300px",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          padding: "0 30px",
          boxSizing: "border-box",
        }}
      >
        {supportedLanguages.map((lang) => {
          return (
            <Stack
              key={lang}
              sx={{
                gap: "0px",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: "70px",
                  lineHeight: "1",
                }}
                align="center"
              >
                {emojiLanguageName[lang]}
              </Typography>
              <Typography align="center" variant="body2">
                {fullEnglishLanguageName[lang]}
              </Typography>
            </Stack>
          );
        })}
      </Stack>
      <Button href="/practice" variant="contained">
        Start practicing
      </Button>
    </Stack>
  );
};

const Price = () => {
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
          boxSizing: "border-box",
          gap: "25px",
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          maxWidth: "550px",
          borderRadius: "18px",
          position: "relative",
          zIndex: 9999,
          backgroundColor: "rgba(7, 15, 26, 0.9)",
          padding: "50px 30px 90px 30px",
          borderTop: "1px solid rgba(0, 0, 0, 1)",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: "18px",
            padding: "7px",
            background: `linear-gradient(135deg, ${startColor}, ${endColor})`,
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            zIndex: -1,
          },
        }}
      >
        <Typography variant="h2" align="center">
          Price
        </Typography>
        <Stack>
          <Typography align="center">Pay as you go</Typography>
          <Typography align="center" variant="body2">
            First lesson is free, then you can buy as many hours as want
          </Typography>
        </Stack>

        <Stack>
          <Typography align="center" variant="h4">
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
                component={"h1"}
              >
                AI Teacher for Learning Languages
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
        <FirsCards />
        <SupportedLanguages />
        <Price />
      </main>
      <Footer />
    </>
  );
}
