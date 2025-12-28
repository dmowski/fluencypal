import { Stack, SxProps, Typography } from "@mui/material";
import { FirstEnterButton } from "./FirstEnterButton";
import { PageLabel } from "../Case/Landing/components/Typography";
import { ArrowRight } from "lucide-react";
import { maxLandingWidth } from "./landingSettings";

interface PreviewCard {
  imageUrl?: string;
  videoUrl?: string;
  alt: string;
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
        "@media (max-width: 1100px)": {
          paddingBottom: "10px",
        },
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
          opacity: 1,
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
            "@media (max-width: 1100px)": {
              flexDirection: "column",
              gap: "150px",
            },
          }}
        >
          <Stack
            sx={{
              gap: "20px",

              alignItems: "flex-start",

              "@media (max-width: 1100px)": {
                alignItems: "center",
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
                "@media (max-width: 1100px)": {
                  textAlign: "center",
                  maxWidth: "100%",
                },
                "@media (max-width: 800px)": {
                  fontSize: "64px",
                  lineHeight: "70px",
                  padding: "0 20px",
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
                  padding: "10px 10px 0 0",
                  fontSize: "1.1rem",
                  textShadow: "0 0 5px rgba(0, 0, 0, 0.71)",
                  "@media (max-width: 600px)": {
                    fontSize: "0.9rem",
                  },
                  "@media (max-width: 1100px)": {
                    textAlign: "center",
                    padding: "0px 10px 0 10px",
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
              const borderRadius = "19px";
              const borderRadiusMobile = "12px";

              const contentStyle: SxProps = {
                height: "580px",
                borderRadius: borderRadius,
                position: "relative",
                zIndex: 2,
                boxShadow: isCenter ? "0 3px 70px rgba(0, 0, 0, 1)" : "0 4px 85px rgba(0, 0, 0, 1)",

                "@media (max-width: 700px)": {
                  height: "400px",
                  borderRadius: borderRadiusMobile,
                },
              };

              return (
                <Stack
                  key={index}
                  sx={{
                    position: "relative",
                    zIndex: isCenter ? 1 : 0,
                    transform: `scale(${isCenter ? 1.05 : 0.9})`,
                    marginLeft: index > 0 ? "-100px" : "0",
                    transition: "transform 0.3s ease-in-out",
                  }}
                >
                  {card.imageUrl && !card.videoUrl && (
                    <Stack component={"img"} alt={card.alt} src={card.imageUrl} sx={contentStyle} />
                  )}
                  {card.videoUrl && (
                    <>
                      {card.imageUrl && (
                        <Stack
                          component={"img"}
                          alt={card.alt}
                          src={card.imageUrl}
                          sx={{
                            ...contentStyle,
                            boxShadow: "none",
                            width: "100%",
                            position: "absolute",
                            top: 0,
                            left: 0,
                            zIndex: 1,
                            //filter: "blur(3px)",
                          }}
                        />
                      )}
                      <Stack
                        component={"video"}
                        autoPlay
                        loop
                        playsInline
                        controls={false}
                        muted
                        sx={{
                          ...contentStyle,
                          aspectRatio: "411 / 896",
                        }}
                        src={card.videoUrl}
                      />
                    </>
                  )}
                  <Stack
                    sx={{
                      background: `#000`,
                      position: "absolute",
                      "--padding": "0px",
                      width: "calc(100% + var(--padding) * 2)",
                      height: "calc(100% + var(--padding) * 2)",
                      top: "calc(0px - var(--padding))",
                      left: "calc(0px - var(--padding))",
                      boxShadow: "0 0 0 0px rgba(0, 0, 0, 1), 0 0 0 1px rgba(255, 255, 255, 1)",
                      borderRadius: borderRadius,
                      "@media (max-width: 700px)": {
                        borderRadius: borderRadiusMobile,
                      },
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
