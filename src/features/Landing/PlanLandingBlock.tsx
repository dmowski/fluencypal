import { Button, Stack, Typography } from "@mui/material";
import { buttonStyle, maxLandingWidth, subTitleFontStyle, titleFontStyle } from "./landingSettings";
import { SupportedLanguage, supportedLanguagesToLearn } from "@/features/Lang/lang";
import { getI18nInstance } from "@/appRouterI18n";
import { cardColors, modeCardProps } from "../Plan/data";
import { PlanElement, PlanElementMode } from "../Plan/types";
import { getUrlStart } from "../Lang/getUrlStart";
import { PlanLandingCard } from "../Plan/PlanLandingCard";
import { Trans } from "@lingui/react/macro";

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
        gap: "100px",
        backgroundColor: `rgba(10, 18, 30, 1)`,
        position: "relative",
        zIndex: 1,
      }}
    >
      <Stack
        sx={{
          alignItems: "center",
          gap: "50px",
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
          }}
        >
          <Typography
            align="center"
            variant="h3"
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
            display: "grid",
            width: "100%",
            boxSizing: "border-box",
            padding: "0 10px",
            gridTemplateColumns: "1fr 1fr",
            alignItems: "center",
            gap: "40px",
            "@media (max-width: 900px)": {
              gridTemplateColumns: "1fr",
              gap: "30px",
            },
            position: "relative",
          }}
        >
          <Stack
            sx={{
              width: "100%",
              height: "600px",
              justifyContent: "center",
              alignItems: "flex-end",
              overflow: "hidden",
              img: {
                width: "auto",
                height: "100%",
              },
              "@media (max-width:1650px)": {
                height: "400px",
              },

              "@media (max-width:900px)": {
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
          <Stack
            sx={{
              borderRadius: "10px",
              padding: "30px",
              alignItems: "flex-start",
              justifyContent: "center",
              gap: "20px",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <Stack
              sx={{
                gap: "0px",
                alignItems: "flex-start",
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
                {i18n._(`Step 1`)}
              </Typography>

              <Typography
                align="left"
                variant="h4"
                component={"h3"}
                sx={{
                  width: "100%",
                  fontSize: "3.5rem",
                  color: "#fff",
                  fontWeight: 800,
                  "@media (max-width: 700px)": {
                    fontSize: "2.5rem",
                  },
                }}
              >
                {i18n._(`Smart Start`)}
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
                {i18n._(
                  `Fill out a quick onboarding quiz to help FluencyPal understand your goals and preferences.`
                )}
              </Typography>

              <Stack
                sx={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "20px",
                  marginTop: "20px",
                  "@media (max-width: 700px)": {
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: "6px",
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
                  href={`${getUrlStart(lang)}quiz`}
                >
                  {i18n._(`Start`)}
                </Button>

                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 400,
                    color: "rgb(1, 162, 255)",
                  }}
                >
                  <Trans>{countOfLanguages} languages to practice</Trans>
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Stack>

        <Stack
          sx={{
            display: "grid",
            width: "100%",
            padding: "10px 10px",
            boxSizing: "border-box",
            gridTemplateColumns: "1fr 1fr",
            alignItems: "center",
            gap: "40px",
            "@media (max-width: 900px)": {
              gridTemplateColumns: "1fr",
              gap: "0px",
            },
            position: "relative",
          }}
        >
          <Stack
            sx={{
              borderRadius: "10px",
              padding: "30px",
              alignItems: "flex-end",
              justifyContent: "center",

              gap: "20px",
              img: {
                width: "200px",
              },

              "@media (max-width: 900px)": {
                alignItems: "flex-start",
              },
            }}
          >
            <Stack
              sx={{
                gap: "0px",
                alignItems: "flex-end",
                "@media (max-width: 900px)": {
                  alignItems: "flex-start",
                },
              }}
            >
              <Typography
                align="right"
                sx={{
                  color: "#fff",
                  fontSize: "1rem",
                  maxWidth: "500px",
                  fontWeight: 300,
                  opacity: 0.8,
                  textTransform: "uppercase",
                  "@media (max-width: 900px)": {
                    textAlign: "left",
                  },
                }}
              >
                {i18n._(`Step 2`)}
              </Typography>

              <Typography
                align="right"
                variant="h4"
                component={"h3"}
                sx={{
                  width: "100%",
                  fontSize: "3.5rem",
                  color: "#fff",
                  fontWeight: 800,
                  "@media (max-width: 900px)": {
                    textAlign: "left",
                    fontSize: "2.5rem",
                  },
                }}
              >
                {i18n._(`Personal Plan`)}
              </Typography>
              <Typography
                align="right"
                sx={{
                  color: "#fff",
                  fontSize: "1rem",
                  maxWidth: "500px",
                  fontWeight: 300,
                  opacity: 0.9,
                  "@media (max-width: 900px)": {
                    textAlign: "left",
                  },
                }}
              >
                {i18n._(
                  `Based on your onboarding, FluencyPal instantly generates a custom learning plan just for you.`
                )}
              </Typography>

              <Button
                variant="outlined"
                sx={{
                  color: "rgba(255, 255, 255, 0.9)",
                  fontWeight: 400,
                  padding: "7px 25px",
                  marginTop: "20px",
                  borderColor: "rgba(255, 255, 255, 0.5)",
                }}
                href={`${getUrlStart(lang)}quiz`}
              >
                {i18n._(`Create a plan`)}
              </Button>
            </Stack>
          </Stack>

          <Stack sx={{}}>
            <Stack
              sx={{
                width: "100%",
                height: "max-content",
                justifyContent: "center",
                alignItems: "flex-end",
                display: "grid",
                gridTemplateColumns: "1fr 1fr  1fr",
                gap: "20px",
                transform: "scale(0.8) translateY(0px) translateX(-70px)",

                "@media (max-width: 1250px)": {
                  transform: "scale(0.8) translateY(-50px) translateX(-70px)",
                  gridTemplateColumns: "1fr 1fr",
                  maxHeight: "700px",
                  overflow: "hidden",
                  position: "relative",
                  "&:after": {
                    content: '""',
                    position: "absolute",
                    bottom: "-10px",
                    left: "0px",
                    width: "100%",
                    height: "300px",
                    background:
                      "linear-gradient(0deg, rgba(10, 18, 30, 1), rgba(10, 18, 30, 0.8), rgba(10, 18, 30, 0))",
                  },
                },

                "@media (max-width: 500px)": {
                  gridTemplateColumns: "1fr",
                },

                "@media (max-width: 900px)": {
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
                {planElements.map((planElement, index) => {
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
            display: "grid",
            width: "100%",
            boxSizing: "border-box",
            padding: "0 10px",
            gridTemplateColumns: "1fr 1fr",
            alignItems: "center",
            gap: "40px",
            "@media (max-width: 900px)": {
              display: "flex",
              flexDirection: "column-reverse",
              width: "100%",
            },
          }}
        >
          <Stack
            sx={{
              width: "100%",
              alignItems: "flex-end",
              "@media (max-width: 900px)": {
                padding: "0 20px",
                boxSizing: "border-box",
              },
            }}
          >
            <Stack
              sx={{
                img: {
                  width: "800px",
                  maxWidth: "100%",
                  height: "auto",
                },
              }}
            >
              <img src="/landing/uiChat.webp" alt="Plan" />
            </Stack>
          </Stack>
          <Stack
            sx={{
              borderRadius: "10px",
              padding: "30px",
              alignItems: "flex-start",

              gap: "20px",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <Stack
              sx={{
                gap: "0px",
                alignItems: "flex-start",
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
                {i18n._(`Step 3`)}
              </Typography>

              <Typography
                align="left"
                variant="h4"
                component={"h3"}
                sx={{
                  width: "100%",
                  fontSize: "3.5rem",
                  color: "#fff",
                  fontWeight: 800,
                  "@media (max-width: 700px)": {
                    fontSize: "2.5rem",
                  },
                }}
              >
                {i18n._(`Practice`)}
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
                {i18n._(
                  `Jump into your tailored learning path and build real skills through engaging practice with AI voice chat.`
                )}
              </Typography>

              <Stack
                sx={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "20px",
                  marginTop: "20px",
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
                  href={`${getUrlStart(lang)}quiz`}
                >
                  {i18n._(`Start`)}
                </Button>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 400,
                    color: "rgb(1, 162, 255, 1)",
                    borderRadius: "8px",
                  }}
                >
                  {i18n._(`1 hour free`)}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </Stack>

      <Stack
        sx={{
          gap: "20px",
          maxWidth: maxLandingWidth,
          boxSizing: "border-box",
          alignItems: "center",
          padding: "60px 10px 20px 10px",
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
