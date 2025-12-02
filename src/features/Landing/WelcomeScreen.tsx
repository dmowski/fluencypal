import { Stack, Typography } from "@mui/material";
import { FirstEnterButton } from "./FirstEnterButton";
import { maxLandingWidth } from "./landingSettings";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getI18nInstance } from "@/appRouterI18n";

interface WelcomeScreenProps {
  getStartedTitle: string;
  pricingLink: string;
  practiceLink: string;
  lang: SupportedLanguage;
  openMyPracticeLinkTitle: string;
  title: string;
  subTitle: string;
}
export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  getStartedTitle,
  practiceLink,
  lang,
  openMyPracticeLinkTitle,
  title,
  subTitle,
}) => {
  const i18n = getI18nInstance(lang);
  return (
    <Stack
      sx={{
        width: "100vw",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Stack
        sx={{
          position: "absolute",
          bottom: 0,
          width: "100vw",
          left: 0,
          height: "100px",
          background: `linear-gradient(180deg, rgba(16, 19, 26, 0) 0%, rgba(16, 19, 26, 1) 100%)`,
          zIndex: 1,
          "@media (max-width: 600px)": {
            height: "100px",
          },
        }}
      />

      <Stack
        sx={{
          position: "absolute",
          backgroundColor: `#10131a`,
          top: 0,
          left: "0px",
          margin: "0 auto",
          width: "100vw",
          overflow: "hidden",
          height: "100%",
          zIndex: -2,
          background: "url('/landing/blur_bg.webp') no-repeat center top",
          backgroundSize: "cover",
          "@media (max-width: 1400px)": {
            height: "90%",
          },
          "@media (max-width: 900px)": {
            height: "130%",
          },

          "@media (max-width: 600px)": {
            display: "none",
          },
        }}
      />

      <Stack
        sx={{
          maxWidth: maxLandingWidth,
          padding: "120px 10px 0px 10px",
          height: "max-content",
          width: "100%",

          boxSizing: "border-box",
          alignItems: "center",

          gap: "100px",
          position: "relative",
          "@media (max-width: 900px)": {},
          "@media (max-width: 600px)": {
            gap: "20px",
            padding: "90px 0px 0 0px",
          },
          "@media (max-width: 500px)": {
            padding: "50px 0px 0 0px",
          },
        }}
      >
        <Stack
          sx={{
            alignItems: "flex-start",
            width: "100%",
            gap: "30px",
            paddingLeft: "15px",
            paddingTop: "60px",
            "@media (max-width: 1200px)": {
              paddingTop: "30px",
            },
            "@media (max-width: 1000px)": {
              paddingTop: "30px",
            },
            "@media (max-width: 900px)": {
              paddingTop: "30px",
            },
            "@media (max-width: 600px)": {
              gap: "10px",
              paddingLeft: "10px",
            },
          }}
        >
          <Stack
            sx={{
              gap: "20px",
              width: "100%",

              ".logoContainer": {
                padding: "20px",
                "@media (max-width: 600px)": {
                  display: "none",
                },
              },
              "@media (max-width: 600px)": {
                gap: "5px",
              },
            }}
          >
            <Typography
              sx={{
                fontSize: "0.8rem",
                fontWeight: 700,
                border: "1px solid rgb(5, 172, 255)",
                backgroundColor: "rgba(5, 172, 255, 0.01)",
                padding: "3px 8px",
                borderRadius: "5px",
                textTransform: "uppercase",
                letterSpacing: "1px",
                color: "#05acff",
                width: "max-content",
                "@media (max-width: 600px)": {
                  marginBottom: "10px",
                },
              }}
            >
              AI
            </Typography>
            <Typography
              variant="h1"
              component={"h1"}
              sx={{
                fontWeight: 700,
                fontSize: "3.7rem",
                maxWidth: "640px",
                textShadow: "0 0 20px rgba(0,0,0,0.7)",
                "@media (max-width: 1300px)": {
                  fontSize: "3.5rem",
                },
                "@media (max-width: 900px)": {
                  fontSize: "3rem",
                },
                "@media (max-width: 700px)": {
                  fontSize: "2rem",
                },
                "@media (max-width: 500px)": {
                  maxWidth: "90vw",
                  fontSize: "1.9rem",
                },
              }}
            >
              {title}
            </Typography>
            <Stack
              sx={{
                gap: "5px",
              }}
            >
              <Typography
                sx={{
                  maxWidth: "500px",
                  padding: "0px 10px 0 0 ",
                  fontSize: "1.1rem",
                  textShadow: "0 0 5px rgba(0, 0, 0, 0.71)",
                  "@media (max-width: 600px)": {
                    fontSize: "0.9rem",
                  },
                  b: {
                    fontWeight: 700,
                    color: "#05acff",
                  },
                }}
              >
                {subTitle}
              </Typography>
            </Stack>
          </Stack>

          <Stack
            sx={{
              flexDirection: "row",
              gap: "15px",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              width: "max-content",
              maxWidth: "100%",
              flexWrap: "wrap",
              "@media (max-width: 1200px)": {
                flexDirection: "column",
              },
            }}
          >
            <FirstEnterButton
              getStartedTitle={getStartedTitle}
              practiceLink={practiceLink}
              openMyPracticeLinkTitle={openMyPracticeLinkTitle}
            />
          </Stack>

          <Stack
            sx={{
              paddingTop: "40px",
              position: "relative",
              "@media (max-width: 600px)": {
                paddingTop: "20px",
              },
              ".interface": {
                width: "961px",
                aspectRatio: "2048 / 1138",
                backgroundColor: "#10131a",
                borderRadius: "20px 20px 0px 0px",
                maxWidth: "calc(100% - 10px)",
                "@media (max-width: 700px)": {
                  borderRadius: "10px",
                },
              },
            }}
          >
            <img
              src="/landing/uiChatClean.webp"
              className="interface"
              alt="User Interface"
              fetchPriority="high"
            />
            <Stack
              sx={{
                display: "block",
                width: "800px",

                height: "200px",
                position: "absolute",

                zIndex: -1,
                top: "80px",
                left: "80px",
                filter: "blur(100px)",
                backgroundColor: "#6260f4",
                opacity: 0.8,
                animation: "moveTop2 4s infinite ease-in-out",
                "@keyframes moveTop2": {
                  "0%": {
                    top: "40px",
                  },
                  "50%": {
                    top: "80px",
                  },
                  "100%": {
                    top: "40px",
                  },
                },
              }}
            />
            <Stack
              sx={{
                display: "block",
                width: "200px",

                height: "400px",
                position: "absolute",
                zIndex: -1,
                top: "40px",
                right: "40px",
                filter: "blur(90px)",
                backgroundColor: "#f89bfd",
                opacity: 0.9,
                animation: "moveTop 3s infinite ease-in-out",
                "@keyframes moveTop": {
                  "0%": {
                    top: "40px",
                  },
                  "50%": {
                    top: "100px",
                  },
                  "100%": {
                    top: "40px",
                  },
                },
              }}
            />
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};
