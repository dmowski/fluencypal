import { TalkingWaves } from "@/features/uiKit/Animations/TalkingWaves";
import { Button, Link, Stack, Typography } from "@mui/material";

import { Footer } from "../Footer";

import { CtaBlock } from "../ctaBlock";
import { getRolePlayScenarios } from "@/features/RolePlay/rolePlayData";
import {
  buttonStyle,
  maxContentWidth,
  subTitleFontStyle,
  titleFontStyle,
} from "../landingSettings";
import { Markdown } from "@/features/uiKit/Markdown/Markdown";
import { RolePlayCard } from "./RolePlayCard";
import {
  fullEnglishLanguageName,
  SupportedLanguage,
  supportedLanguages,
} from "@/features/Lang/lang";
import { getI18nInstance } from "@/appRouterI18n";
import { getUrlStart } from "@/features/Lang/getUrlStart";
import { HeaderStatic } from "@/features/Header/HeaderStatic";
import { FeatureList } from "../Price/FeatureList";

interface ScenarioOnePageProps {
  id?: string;
  lang: SupportedLanguage;
}

export const ScenarioOnePage = ({ id, lang }: ScenarioOnePageProps) => {
  const i18n = getI18nInstance(lang);
  const { rolePlayScenarios } = getRolePlayScenarios(lang);
  const item = rolePlayScenarios.find((scenario) => scenario.id === id);
  if (!item) {
    return null;
  }

  const relatedCards = rolePlayScenarios.filter(
    (scenario) => scenario.category === item.category && item.id !== scenario.id
  );

  return (
    <>
      <HeaderStatic lang={lang} />
      <div
        style={{
          width: "100%",
          margin: 0,
        }}
      >
        <TalkingWaves />

        <Stack
          component={"main"}
          sx={{
            alignItems: "center",
            width: "100%",
            backgroundColor: `#fff`,
          }}
        >
          <Stack
            sx={{
              width: "100%",
              alignItems: "center",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(10px)",
              zIndex: 2,
              top: "-10px",
              "@media (max-width: 900px)": {
                position: "relative",
              },
              "@media (max-height: 600px)": {
                position: "relative",
              },
            }}
          >
            <Stack
              sx={{
                maxWidth: maxContentWidth,
                width: "100%",
                boxSizing: "border-box",
                alignItems: "center",
                padding: "110px 10px 20px 10px",
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                gap: "10px",

                flexWrap: "wrap",
              }}
            >
              <Stack
                gap={"0px"}
                sx={{
                  width: "max-content",
                }}
              >
                <Typography
                  component={"h1"}
                  sx={{
                    ...titleFontStyle,
                    fontSize: "2rem",
                    color: "#000",
                  }}
                >
                  {item.title}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    maxWidth: "810px",

                    ...subTitleFontStyle,
                    color: "#666",
                    fontSize: "1.1rem",
                  }}
                >
                  {item.subTitle}
                </Typography>
              </Stack>
              <Stack
                sx={{
                  width: "max-content",
                  flexDirection: "row",
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: "10px",
                  flexWrap: "wrap",
                  "@media (max-width: 900px)": {
                    justifyContent: "flex-start",
                  },
                }}
              >
                <Button
                  variant="text"
                  href={`${getUrlStart(lang)}scenarios`}
                  sx={{
                    ...buttonStyle,
                    borderRadius: "4px",
                    height: "3rem",

                    color: "rgb(43 35 88)",
                    borderColor: "rgb(43 35 88)",
                    borderWidth: "1px",

                    backgroundColor: "#fff",
                  }}
                >
                  {i18n._(`View all`)}
                </Button>
                <Button
                  href={`${getUrlStart(lang)}practice?rolePlayId=${item.id}${item.isCallModeByDefault ? "&isCallMode=true" : ""}`}
                  sx={{
                    ...buttonStyle,
                    height: "3rem",
                    borderRadius: "4px",
                  }}
                  variant="contained"
                >
                  {i18n._(`Play the role`)}
                </Button>
              </Stack>
            </Stack>
          </Stack>
          <Stack
            sx={{
              width: "100%",
              padding: "0px 0 90px 0",
              alignItems: "center",
              justifyContent: "center",
              gap: "40px",
              backgroundColor: `#fff`,
              position: "relative",
              zIndex: 1,
            }}
          >
            <Stack
              sx={{
                alignItems: "center",
                gap: "20px",
                width: "100%",
              }}
            >
              <Stack
                sx={{
                  width: "100%",
                  backgroundColor: "rgba(125, 123, 74, 0.4)",
                  alignItems: "center",
                  borderRadius: "20px",
                  padding: "40px 15px 0 15px",
                  boxSizing: "border-box",
                  maxWidth: maxContentWidth,
                  overflow: "hidden",
                  maxHeight: "300px",
                  position: "relative",
                }}
              >
                <img
                  src={item.imageSrc}
                  alt="Role Play Scenarios"
                  style={{
                    width: "max-content",
                    maxWidth: "100%",
                    height: "400px",
                    borderRadius: "20px 20px 0 0",
                    boxShadow: "0px 0px 20px 0px rgba(0,0,0,0.3)",
                    position: "relative",
                    //zIndex: 0,
                  }}
                />
                <Stack
                  sx={{
                    backgroundImage: `url(${item.imageSrc})`,
                    filter: "blur(50px)",
                    backgroundSize: "cover",
                    opacity: 0.5,
                    position: "absolute",
                    bottom: 0,
                    left: "-50%",
                    top: "-50%",

                    width: "200%",
                    height: "200%",
                    zIndex: -1,
                  }}
                ></Stack>
              </Stack>
            </Stack>

            <Stack
              sx={{
                color: "#222",
                maxWidth: maxContentWidth,
                width: "100%",
                padding: "10px",
                gap: "60px",
                boxSizing: "border-box",
                display: "grid",
                gridTemplateColumns: "3fr 1.3fr",
                "@media (max-width: 900px)": {
                  gridTemplateColumns: "1fr",
                },
              }}
            >
              <Stack
                sx={{
                  gap: "30px",
                }}
              >
                <Stack
                  sx={{
                    maxWidth: "800px",
                    boxSizing: "border-box",
                    width: "100%",
                    color: `#222`,
                    padding: "0px 0px",
                    gap: "20px",
                    alignItems: "flex-start",
                    h2: {
                      fontSize: "1.2rem",
                      fontWeight: 600,
                      paddingBottom: "0px",
                      paddingTop: "30px",
                    },
                  }}
                >
                  {item.contentPage && <Markdown variant="small">{`${item.contentPage}`}</Markdown>}
                  {item.contendElement}

                  {item.youTubeVideoUrl && (
                    <iframe
                      width="100%"
                      height="600px"
                      src="https://www.youtube.com/embed/e_1NupxxPcQ"
                      title={"YouTube video player of the scenario"}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    ></iframe>
                  )}
                </Stack>

                {item.exampleOfFirstMessageFromAi && (
                  <Stack
                    sx={{
                      maxWidth: "800px",
                      boxSizing: "border-box",
                      width: "100%",
                      alignItems: "flex-start",
                      gap: "15px",
                    }}
                  >
                    <Stack>
                      <Typography
                        variant="h6"
                        component={"h2"}
                        sx={{
                          fontWeight: 600,
                          fontSize: "1.2rem",
                        }}
                      >
                        {i18n._(`Ready to play?`)}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "1rem",
                        }}
                      >
                        {item.exampleOfFirstMessageFromAi}
                      </Typography>
                    </Stack>
                    <Stack
                      sx={{
                        flexDirection: "column",
                        gap: "5px 20px",
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      <Button
                        variant="outlined"
                        sx={{
                          ...buttonStyle,
                          minWidth: "300px",
                        }}
                        href={`${getUrlStart(lang)}practice?rolePlayId=${item.id}`}
                      >
                        {i18n._(`Start`)} "{item.shortTitle}"
                      </Button>
                      <Stack
                        sx={{
                          flexDirection: "column",
                          gap: "1px",
                        }}
                      >
                        <Typography variant="caption">
                          {i18n._(`No credit card required`)}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                )}

                <Stack
                  sx={{
                    gap: "5px",
                  }}
                >
                  <Typography
                    variant="h6"
                    component={"h2"}
                    sx={{
                      fontWeight: 600,
                      fontSize: "1.2rem",
                    }}
                  >
                    {i18n._(`Benefits of Role Play`)}: {item.shortTitle}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "1rem",
                    }}
                  >
                    {i18n._(
                      `Role play allows you to practice real-life scenarios in a safe environment, helping you build confidence and improve your language skills.`
                    )}
                  </Typography>
                </Stack>
                <Stack>
                  <Typography
                    variant="h6"
                    component={"h2"}
                    sx={{
                      fontWeight: 600,
                      fontSize: "1.2rem",
                    }}
                  >
                    {i18n._(`Anything else?`)}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "1rem",
                      paddingBottom: "10px",
                    }}
                  >
                    {i18n._(
                      `With FluencyPal, you can improve your learning experience with personalized feedback, real-time corrections, and a supportive community.`
                    )}
                  </Typography>
                  <FeatureList />
                  <Stack
                    sx={{
                      width: "100%",
                    }}
                  >
                    <Stack
                      sx={{
                        gap: "0px",
                      }}
                    >
                      <Typography
                        variant="h6"
                        component={"h2"}
                        sx={{
                          fontSize: "1.2rem",
                          fontWeight: 600,
                          paddingBottom: "5px",
                        }}
                      >
                        {i18n._(`Available languages:`)}
                      </Typography>
                      <Typography variant="body2" component={"p"}>
                        {supportedLanguages.map((code) => fullEnglishLanguageName[code]).join(", ")}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </Stack>
            </Stack>

            {relatedCards.length > 0 && (
              <Stack
                sx={{
                  color: "#222",
                  maxWidth: maxContentWidth,
                  width: "100%",
                  padding: "10px",
                  gap: "20px",
                  boxSizing: "border-box",
                }}
              >
                <Typography
                  variant="h6"
                  component={"h2"}
                  sx={{
                    fontWeight: 600,
                  }}
                >
                  {i18n._(`Related Scenarios`)}
                </Typography>

                <Stack
                  sx={{
                    display: "grid",
                    width: "100%",
                    gap: "20px",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    justifyContent: "space-between",
                    "@media (max-width: 1224px)": {
                      gridTemplateColumns: "1fr 1fr",
                    },

                    "@media (max-width: 724px)": {
                      gridTemplateColumns: "1fr",
                    },
                  }}
                >
                  {relatedCards.map((scenario, index) => {
                    return (
                      <RolePlayCard key={index} scenario={scenario} lang={lang} height="400px" />
                    );
                  })}
                </Stack>
              </Stack>
            )}
          </Stack>
        </Stack>

        <CtaBlock
          title={i18n._(`Ready to Become Fluent in English?`)}
          actionButtonTitle={i18n._(`Start Your Free Trial`)}
          actionButtonLink={`${getUrlStart(lang)}quiz`}
        />
      </div>
      <Footer lang={lang} />
    </>
  );
};
