import { Button, Stack, Typography } from "@mui/material";
import { buttonStyle, maxLandingWidth, subTitleFontStyle, titleFontStyle } from "./landingSettings";
import { SupportedLanguage, supportedLanguagesToLearn } from "@/features/Lang/lang";
import { getI18nInstance } from "@/appRouterI18n";
import { cardColors, modeCardProps } from "../Plan/data";
import { PlanElement, PlanElementMode } from "../Plan/types";
import { getUrlStart } from "../Lang/getUrlStart";
import { PlanLandingCard } from "../Plan/PlanLandingCard";
import { Trans } from "@lingui/react/macro";

interface ColorCardProps {
  videoUrl: string;
  imgUrl: string;
  label: string;
  title: string;
  description: string;
  actionButtonPostfixLabel: string | React.ReactNode;
  actionButtonLabel: string;
  actionButtonHref: string;
  hideVideoOnMobile?: boolean;
}

const ColorCard = ({
  videoUrl,
  imgUrl,
  label,
  title,
  description,
  actionButtonPostfixLabel,
  actionButtonLabel,
  actionButtonHref,
  hideVideoOnMobile,
}: ColorCardProps) => {
  return (
    <Stack
      sx={{
        padding: "30px",
        alignItems: "flex-start",
        justifyContent: "center",
        gap: "20px",
        boxSizing: "border-box",
        width: "437px",
        height: "322px",
        position: "relative",
        borderRadius: "20px",
        zIndex: 1,
        ".bgCardImg": {
          position: "absolute",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
          zIndex: 0,
          opacity: 0.7,
          transform: "rotate(90deg) scale(1.35)",
        },
        "@media (max-width:1000px)": {
          zIndex: hideVideoOnMobile ? 2 : 1,
        },

        "@media (max-width:500px)": {
          transform: "scale(0.9)",
        },

        "@media (max-width:400px)": {
          transform: "scale(0.8)",
        },

        "@media (max-width:360px)": {
          transform: "scale(0.7)",
        },
        "@media (max-width:330px)": {
          transform: "scale(0.6)",
        },
      }}
    >
      <img src={imgUrl} alt="" className="bgCardImg" />
      <Stack
        sx={{
          position: "absolute",
          top: "-185px",
          left: "-188px",
          width: "850px",
          height: "690px",
          zIndex: -1,
          opacity: 1,
          overflow: "hidden",
          borderRadius: "30px 30px 40px 100px",
          "--color-card-shadow": "0 0 50px 40px #050709, 0 0 300px 10px rgba(0, 0, 0, 1)",
          boxShadow: `var(--color-card-shadow)`,

          video: {
            position: "absolute",
            zIndex: -2,
            top: "0px",
            left: "0px",
            width: "850px",
            height: "750px",
            borderRadius: "0",
            transform: "scale(1.2) rotate(90deg)",
          },

          "@media (max-width:1000px)": {
            overflow: "visible",
            boxShadow: "none",
            video: {
              display: hideVideoOnMobile ? "none" : "",
            },
          },

          "@media (max-width:400px)": {
            width: "850px",
            height: "710px",
          },
        }}
      >
        <video src={videoUrl} loop muted autoPlay playsInline />
      </Stack>
      <Stack
        sx={{
          gap: "0px",
          alignItems: "flex-start",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Typography
          sx={{
            color: "#fff",
            fontSize: "1rem",
            maxWidth: "500px",
            fontWeight: 300,
            opacity: 0.8,
            textTransform: "uppercase",
          }}
        >
          {label}
        </Typography>

        <Typography
          align="left"
          variant="h4"
          component={"h3"}
          sx={{
            width: "100%",
            fontSize: "2rem",
            color: "#fff",
            fontWeight: 800,
            "@media (max-width: 500px)": {
              fontSize: "1.9rem",
            },
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            color: "#fff",
            fontSize: "1rem",
            maxWidth: "500px",
            fontWeight: 300,
            opacity: 0.9,
          }}
        >
          {description}
        </Typography>

        <Stack
          sx={{
            flexDirection: "row",
            alignItems: "center",
            gap: "20px",
            marginTop: "20px",
            "@media (max-width: 500px)": {
              flexWrap: "wrap",
              gap: "20px",
            },
          }}
        >
          <Button
            variant="outlined"
            sx={{
              color: "rgba(255, 255, 255, 0.9)",
              fontWeight: 400,
              padding: "7px 25px",

              borderColor: "rgba(255, 255, 255, 0.5)",
            }}
            href={actionButtonHref}
          >
            {actionButtonLabel}
          </Button>

          <Typography
            variant="caption"
            sx={{
              fontWeight: 400,
              color: "rgb(1, 162, 255)",
            }}
          >
            {actionButtonPostfixLabel}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
};

interface PlanLandingBlockProps {
  lang: SupportedLanguage;
}
export const PlanLandingBlock: React.FC<PlanLandingBlockProps> = ({ lang }) => {
  const i18n = getI18nInstance(lang);

  const planElements: PlanElement[] = [
    {
      id: "psychology-vocab",
      title: i18n._(`Psychology`),
      subTitle: i18n._(`Mental Health Vocabulary`),
      mode: "words",
      description: i18n._(`Essential words for discussing mental health and psychology.`),
      details: "",
      startCount: 0,
    },
    {
      id: "medical-roleplay",
      title: i18n._(`Diagnosis`),
      subTitle: i18n._(`Medical Talk Simulation`),
      mode: "play",
      description: i18n._(`Practice medical conversations through simulated scenarios.`),
      details: "",
      startCount: 0,
    },
    {
      id: "quick-thinking",
      title: i18n._(`Reflex`),
      subTitle: i18n._(`Fast Answer Practice`),
      mode: "play",
      description: i18n._(`Improve your ability to answer quickly and clearly in conversations.`),
      details: "",
      startCount: 0,
    },
    {
      id: "confidence",
      title: i18n._(`Speaking`),
      subTitle: i18n._(`Public Talk Skills`),
      mode: "conversation",
      description: i18n._(`Boost your confidence in public speaking.`),
      details: "",
      startCount: 0,
    },
    {
      id: "toefl-vocab",
      title: i18n._(`TOEFL`),
      subTitle: i18n._(`Academic Word List`),
      mode: "words",
      description: i18n._(`Master high-frequency TOEFL vocabulary.`),
      details: "",
      startCount: 0,
    },
    {
      id: "toefl-sim",
      title: i18n._(`Mock`),
      subTitle: i18n._(`TOEFL Speaking Tasks`),
      mode: "play",
      description: i18n._(`Simulate speaking tasks from the TOEFL exam.`),
      details: "",
      startCount: 0,
    },
    {
      id: "grammar-academic",
      title: i18n._(`Grammar`),
      subTitle: i18n._(`Advanced Academic Usage`),
      mode: "rule",
      description: i18n._(`Learn grammar used in academic writing and speaking.`),
      details: "",
      startCount: 0,
    },

    {
      id: "health-strategies",
      title: i18n._(`Wellness`),
      subTitle: i18n._(`Mental Health Talk`),
      mode: "conversation",
      description: i18n._(`Explore techniques to talk about wellness and mental well-being.`),
      details: "",
      startCount: 0,
    },
    {
      id: "academic-style",
      title: i18n._(`Essays`),
      subTitle: i18n._(`Formal Writing Practice`),
      mode: "rule",
      description: i18n._(`Develop formal writing skills for academic success.`),
      details: "",
      startCount: 0,
    },
  ];

  const modeLabels: Record<PlanElementMode, string> = {
    conversation: i18n._(`Conversation`),
    play: i18n._(`Role Play`),
    words: i18n._(`Words`),
    rule: i18n._(`Rule`),
  };

  const countOfLanguages = supportedLanguagesToLearn.length;

  return (
    <Stack
      sx={{
        width: "100%",
        padding: "60px 0 180px 0",
        alignItems: "center",
        justifyContent: "center",
        gap: "00px",
        backgroundColor: `#050709`,
        //backgroundColor: `red`,
        position: "relative",
        zIndex: 1,
        overflow: "hidden",
      }}
    >
      <Stack
        sx={{
          alignItems: "center",
          gap: "70px",
          width: "100%",
        }}
      >
        <Stack
          sx={{
            gap: "20px",
            maxWidth: maxLandingWidth,
            boxSizing: "border-box",
            alignItems: "center",
            padding: "0 10px",
            position: "relative",
            zIndex: 2,
          }}
        >
          <Typography
            align="center"
            variant="h2"
            component={"h2"}
            sx={{
              ...titleFontStyle,
              color: "#fff",
            }}
          >
            {i18n._(`How It Works`)}
          </Typography>
          <Typography
            align="center"
            variant="body1"
            sx={{
              maxWidth: "810px",
              color: "#fff",
              ...subTitleFontStyle,
            }}
          >
            {i18n._(`From Onboarding to Your Goal`)}
          </Typography>
        </Stack>

        <Stack
          sx={{
            display: "flex",
            width: "100%",
            boxSizing: "border-box",
            padding: "0 10px",
            flexDirection: "row",
            alignItems: "center",
            gap: "40px",
            "@media (max-width: 1000px)": {
              flexDirection: "column",
              gap: "30px",
            },
            position: "relative",
          }}
        >
          <Stack
            sx={{
              width: "calc(50vw - 10px)",
              border: "0px solid red",
              boxSizing: "border-box",
              height: "600px",
              justifyContent: "center",
              alignItems: "flex-end",
              overflow: "hidden",
              position: "relative",
              zIndex: 2,
              img: {
                width: "700px",
                height: "auto",
              },
              "@media (max-width:1650px)": {
                height: "400px",
              },

              "@media (max-width:1200px)": {
                img: {
                  width: "500px",
                },
              },

              "@media (max-width:1000px)": {
                opacity: 0,
                position: "absolute",
                top: "0px",
                left: "0px",
                zIndex: -1,
              },
            }}
          >
            <img src="/landing/survey.webp" alt="Plan" />
          </Stack>
          <ColorCard
            videoUrl={"/landing/blue.mp4"}
            imgUrl={"/landing/blue.svg"}
            label={i18n._(`Step 1`)}
            title={i18n._(`Smart Start`)}
            description={i18n._(
              `Fill out a onboarding quiz to help FluencyPal understand your goals and preferences.`
            )}
            actionButtonPostfixLabel={<Trans>{`${countOfLanguages} languages to practice`}</Trans>}
            actionButtonLabel={i18n._(`Start`)}
            actionButtonHref={`${getUrlStart(lang)}quiz`}
          />
        </Stack>

        <Stack
          sx={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            padding: "10px 10px",
            boxSizing: "border-box",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "140px",

            "@media (max-width: 1200px)": {
              gap: "70px",
            },

            "@media (max-width: 1000px)": {
              flexDirection: "column",
              alignItems: "center",
              gap: "0px",
            },
            position: "relative",
          }}
        >
          <ColorCard
            videoUrl={"/landing/green.mp4"}
            imgUrl={"/landing/green.svg"}
            label={i18n._(`Step 2`)}
            title={i18n._(`Personal Plan`)}
            description={i18n._(
              `Based on your onboarding, FluencyPal instantly generates a custom learning plan just for you.`
            )}
            actionButtonPostfixLabel={""}
            actionButtonLabel={i18n._(`Create a plan`)}
            actionButtonHref={`${getUrlStart(lang)}quiz`}
            hideVideoOnMobile={true}
          />

          <Stack
            sx={{
              position: "relative",
              zIndex: 2,
              width: "calc(50vw - 10px)",
              border: "0px solid red",
              "@media (max-width: 1000px)": {
                display: "none",
              },
              justifyContent: "flex-start",
              alignItems: "flex-start",
            }}
          >
            <Stack
              sx={{
                width: "568px",
                height: "max-content",
                justifyContent: "center",
                alignItems: "flex-end",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                transform: "scale(0.78) translateY(-10px) translateX(35px)",
                transformOrigin: "left",

                "@media (max-width: 1250px)": {
                  transform: "scale(0.8) translateY(-10px) translateX(35px)",
                  gridTemplateColumns: "1fr 1fr",
                  position: "relative",
                },

                "@media (max-width: 500px)": {
                  gridTemplateColumns: "1fr",
                },

                "@media (max-width: 1000px)": {
                  transform: "scale(1)",
                  padding: "30px",
                  boxSizing: "border-box",
                  maxHeight: "520px",
                  ".plan-landing-card": {
                    height: "150px",
                  },
                  "&:after": {
                    bottom: "-10px",
                    left: "0px",
                    width: "100%",
                    height: "100%",
                    background:
                      "linear-gradient(0deg, rgba(10, 18, 30, 1), rgba(10, 18, 30, 0), rgba(10, 18, 30, 1))",
                  },
                },
              }}
            >
              <>
                {planElements
                  .filter((element, index) => index < 6)
                  .map((planElement, index) => {
                    const cardInfo = modeCardProps[planElement.mode];
                    const colorIndex = index % cardColors.length;
                    const cardColor = cardColors[colorIndex];
                    const elementsWithSameMode =
                      planElements.filter((element) => element.mode === planElement.mode) || [];
                    const currentElementIndex = elementsWithSameMode.findIndex(
                      (element) => element.id === planElement.id
                    );

                    const imageVariants = cardInfo.imgUrl;
                    const imageIndex = currentElementIndex % imageVariants.length;
                    const imageUrl = imageVariants[imageIndex];

                    return (
                      <PlanLandingCard
                        key={planElement.id}
                        delayToShow={index * 80}
                        title={planElement.title}
                        subTitle={modeLabels[planElement.mode]}
                        description={planElement.description}
                        startColor={cardColor.startColor}
                        endColor={cardColor.endColor}
                        bgColor={cardColor.bgColor}
                        icon={
                          <Stack>
                            <Stack className="avatar">
                              <img src={imageUrl} alt="" />
                            </Stack>
                          </Stack>
                        }
                        actionLabel={i18n._(`Start`)}
                      />
                    );
                  })}
              </>
            </Stack>
          </Stack>
        </Stack>

        <Stack
          sx={{
            display: "flex",
            width: "100%",
            boxSizing: "border-box",
            padding: "0 10px",
            flexDirection: "row",
            alignItems: "center",
            gap: "100px",
            "@media (max-width: 1000px)": {
              flexDirection: "column",
              gap: "30px",
            },
            position: "relative",
          }}
        >
          <Stack
            sx={{
              width: "calc(50vw - 60px)",
              border: "0px solid red",
              boxSizing: "border-box",
              height: "600px",
              justifyContent: "center",
              alignItems: "flex-end",
              overflow: "hidden",
              position: "relative",
              zIndex: 2,
              img: {
                width: "600px",
                height: "auto",
              },
              "@media (max-width:1200px)": {
                img: {
                  width: "500px",
                },
              },

              "@media (max-width:1000px)": {
                display: "none",
              },
            }}
          >
            <img src="/landing/uiChat.webp" alt="uiChat" />
          </Stack>
          <ColorCard
            videoUrl={"/landing/purple.mp4"}
            imgUrl={"/landing/purple.svg"}
            label={i18n._(`Step 3`)}
            title={i18n._(`Practice`)}
            description={i18n._(
              `Jump into your tailored learning path and build real skills through engaging practice with AI voice chat.`
            )}
            actionButtonPostfixLabel={i18n._(`3 days free`)}
            actionButtonLabel={i18n._(`Start`)}
            actionButtonHref={`${getUrlStart(lang)}quiz`}
          />
        </Stack>
      </Stack>

      <Stack
        sx={{
          gap: "20px",
          maxWidth: maxLandingWidth,
          boxSizing: "border-box",
          alignItems: "center",
          padding: "60px 10px 20px 10px",
          position: "relative",
          zIndex: 3,
        }}
      >
        <Typography
          align="center"
          variant="body1"
          sx={{
            maxWidth: "810px",
            color: "#fff",
            ...subTitleFontStyle,
          }}
        >
          {i18n._(`Results are closer than you think`)}
        </Typography>
        <Button
          sx={{
            ...buttonStyle,
            padding: "10px 70px",
            color: "#000",
            backgroundColor: "#05acff",
          }}
          variant="contained"
          size="large"
          href={`${getUrlStart(lang)}quiz`}
        >
          {i18n._(`Start Learning`)}
        </Button>
      </Stack>
    </Stack>
  );
};
