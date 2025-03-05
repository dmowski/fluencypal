import { TalkingWaves } from "@/features/uiKit/Animations/TalkingWaves";
import { Button, Link, Stack, Typography } from "@mui/material";
import { Header } from "../../Header/Header";

import { Footer } from "../Footer";

import { CtaBlock } from "../ctaBlock";
import rolePlayScenarios from "@/features/RolePlay/rolePlayData";
import {
  buttonStyle,
  maxContentWidth,
  subTitleFontStyle,
  titleFontStyle,
} from "../landingSettings";
import { Markdown } from "@/features/uiKit/Markdown/Markdown";
import { RolePlayCard } from "./RolePlayCard";
import { fullEnglishLanguageName, supportedLanguages } from "@/common/lang";

interface ScenarioOnePageProps {
  id?: string;
}

export const ScenarioOnePage = ({ id }: ScenarioOnePageProps) => {
  const item = rolePlayScenarios.find((scenario) => scenario.id === id);
  if (!item) {
    return null;
  }

  const relatedCards = rolePlayScenarios.filter(
    (scenario) => scenario.category === item.category && item.id !== scenario.id
  );

  return (
    <>
      <Header />
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
              position: "sticky",
              backgroundColor: "#fff",
              zIndex: 2,
              top: "-10px",
              "@media (max-width: 900px)": {
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
                  variant="outlined"
                  href="/scenarios"
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
                  View all scenarios
                </Button>
                <Button
                  href="/practice"
                  sx={{
                    ...buttonStyle,
                    height: "3rem",
                    borderRadius: "4px",
                  }}
                  variant="contained"
                >
                  Use Scenario
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
                    height: "450px",
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
                  gap: "40px",
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
                      paddingBottom: "10px",
                      paddingTop: "30px",
                    },
                  }}
                >
                  <Markdown size="small">{item.contentPage}</Markdown>
                </Stack>

                {item.exampleOfFirstMessageFromAi && (
                  <Stack
                    sx={{
                      maxWidth: "800px",
                      boxSizing: "border-box",
                      width: "100%",
                      backgroundColor: `rgba(10, 18, 30, 1)`,
                      color: `#fff`,
                      padding: "30px 30px",
                      borderRadius: "20px",
                      gap: "20px",
                      alignItems: "flex-start",
                      marginBottom: "20px",
                    }}
                  >
                    <Typography
                      align="left"
                      className="decor-text"
                      sx={{
                        fontSize: "1.5rem",
                        color: "#fff",
                      }}
                    >
                      {item.exampleOfFirstMessageFromAi}
                    </Typography>
                    <Button variant="outlined" href="/practice">
                      Play The Role
                    </Button>
                  </Stack>
                )}
              </Stack>
              <Stack
                sx={{
                  width: "100%",
                }}
              >
                <Stack
                  sx={{
                    gap: "10px",
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
                    Available languages:
                  </Typography>
                  <Stack
                    gap={"5px"}
                    sx={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                    }}
                  >
                    {supportedLanguages.map((code, index) => {
                      const isLast = index === supportedLanguages.length - 1;
                      return (
                        <Typography key={code} variant="body2" component={"p"}>
                          {fullEnglishLanguageName[code]}
                          {isLast ? "" : ","}
                        </Typography>
                      );
                    })}
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
                  Related Scenarios
                </Typography>

                <Stack
                  sx={{
                    display: "grid",
                    width: "max-content",
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
                    return <RolePlayCard key={index} scenario={scenario} />;
                  })}
                </Stack>
              </Stack>
            )}
          </Stack>
        </Stack>

        <CtaBlock />
      </div>
      <Footer />
    </>
  );
};
