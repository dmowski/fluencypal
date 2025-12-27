import { Stack, Typography } from "@mui/material";
import { FirstEnterButton } from "./FirstEnterButton";
import { PageLabel } from "../Case/Landing/components/Typography";
import { ArrowRight } from "lucide-react";

interface PreviewCard {
  imageUrl?: string;
  videoUrl?: string;
}

interface WelcomeScreenProps {
  label: string;
  title: string;
  subTitle1: string;
  subTitle2: string;
  buttonTitle: string;
  buttonHref: string;
  openMyPracticeLinkTitle: string;
  cards: PreviewCard[];
}

export const WelcomeScreen2: React.FC<WelcomeScreenProps> = ({
  label,
  title,
  subTitle1,
  subTitle2,
  buttonTitle,
  buttonHref,
  cards,
  openMyPracticeLinkTitle,
}) => {
  return (
    <Stack
      sx={{
        width: "100vw",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        padding: "70px 0 100px 0",
      }}
    >
      <Stack
        sx={{
          position: "absolute",
          bottom: 0,
          width: "100vw",
          left: 0,
          height: "170px",
          background: `linear-gradient(180deg, rgba(16, 19, 26, 0) 0%, rgba(16, 19, 26, 1) 100%)`,
          zIndex: 1,
          opacity: 1,
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
          background: "url('/landing/preview/space.webp') no-repeat center center",
          backgroundSize: "cover",

          opacity: 0.4,
        }}
      />

      <Stack
        sx={{
          maxWidth: "1400px",
          padding: "120px 10px 0px 10px",
          height: "max-content",
          width: "100%",

          boxSizing: "border-box",
          alignItems: "center",

          gap: "100px",
          position: "relative",
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
            flexDirection: "row",
            gap: "10px",
            width: "100%",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: "100px",
          }}
        >
          <Stack
            sx={{
              gap: "20px",

              alignItems: "flex-start",

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
            <PageLabel>{label}</PageLabel>
            <Typography
              variant="h1"
              component={"h1"}
              sx={{
                fontWeight: 900,
                fontSize: "96px",
                lineHeight: "100px",
                maxWidth: "800px",
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
                    fontWeight: 600,
                  },
                }}
              >
                <b>{subTitle1}</b> {subTitle2}
              </Typography>
            </Stack>

            <Stack
              sx={{
                paddingTop: "40px",
              }}
            >
              <FirstEnterButton
                getStartedTitle={buttonTitle}
                practiceLink={buttonHref}
                openMyPracticeLinkTitle={openMyPracticeLinkTitle}
                endIcon={<ArrowRight />}
              />
            </Stack>
          </Stack>

          <Stack
            sx={{
              flexDirection: "row",
            }}
          >
            {cards.map((card, index) => {
              const isCenter = index === 1;
              return (
                <Stack
                  key={index}
                  sx={{
                    position: "relative",
                    zIndex: isCenter ? 1 : 0,
                    transform: `scale(${isCenter ? 1.1 : 1})`,
                    marginLeft: index > 0 ? "-100px" : "0",
                    transition: "transform 0.3s ease, z-index 0.3s ease",
                    ":hover": {
                      transform: `scale(${isCenter ? 1.2 : 1.05})`,
                    },
                  }}
                >
                  <Stack
                    sx={{
                      background: `#000`,
                      position: "absolute",
                      "--padding": "3px",
                      width: "calc(100% - var(--padding) * 2)",
                      height: "calc(100% - var(--padding) * 2)",
                      top: "var(--padding)",
                      left: "var(--padding)",
                      borderRadius: "40px",
                    }}
                  />
                  <Stack
                    component={"img"}
                    src="/landing/preview/iphone.webp"
                    sx={{
                      height: "500px",
                      position: "relative",
                      zIndex: 2,
                    }}
                  />
                  <Stack
                    sx={{
                      background: `url('${card.imageUrl}') no-repeat center center`,
                      backgroundSize: "cover",
                      position: "absolute",
                      "--padding": "14px",
                      width: "calc(100% - var(--padding) * 2)",
                      height: "calc(100% - var(--padding) * 2)",
                      top: "var(--padding)",
                      left: "var(--padding)",
                      borderRadius: "30px",
                      overflow: "hidden",
                    }}
                  />
                </Stack>
              );
            })}
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};
