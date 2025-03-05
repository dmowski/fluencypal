import { TalkingWaves } from "@/features/uiKit/Animations/TalkingWaves";
import { Button, Stack, Typography } from "@mui/material";
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

interface ScenarioOnePageProps {
  id?: string;
}

export const ScenarioOnePage = ({ id }: ScenarioOnePageProps) => {
  const item = rolePlayScenarios.find((scenario) => scenario.id === id);
  if (!item) {
    return null;
  }

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
          sx={{
            alignItems: "center",
            width: "100%",
          }}
        >
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
                  maxWidth: maxContentWidth,
                  width: "100%",
                  boxSizing: "border-box",
                  alignItems: "center",
                  padding: "110px 10px 20px 10px",
                  display: "flex",
                  flexDirection: "row",
                  gap: "60px",
                  position: "sticky",
                  top: "0px",
                  backgroundColor: "#fff",
                }}
              >
                <Stack
                  gap={"0px"}
                  sx={{
                    width: "100%",
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
                    width: "100%",
                    flexDirection: "row",
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: "20px",
                  }}
                >
                  <Button
                    variant="outlined"
                    href="/scenarios"
                    sx={{
                      ...buttonStyle,

                      color: "rgb(43 35 88)",
                      borderColor: "rgb(43 35 88)",
                      borderWidth: "2px",

                      backgroundColor: "#fff",
                    }}
                  >
                    View all scenarios
                  </Button>
                  <Button
                    href="/practice"
                    sx={{
                      ...buttonStyle,
                    }}
                    variant="contained"
                  >
                    Use Scenario
                  </Button>
                </Stack>
              </Stack>
              <Stack
                sx={{
                  width: "100%",
                  backgroundColor: "rgba(125, 123, 74, 0.4)",
                  alignItems: "center",
                  borderRadius: "20px",
                  paddingTop: "40px",
                  maxWidth: maxContentWidth,
                  overflow: "hidden",
                  maxHeight: "300px",
                }}
              >
                <img
                  src={item.imageSrc}
                  alt="Role Play Scenarios"
                  style={{
                    width: "max-content",
                    height: "450px",
                    borderRadius: "20px 20px 0 0",
                    boxShadow: "0px 0px 20px 0px rgba(0,0,0,0.3)",
                  }}
                />
              </Stack>
            </Stack>

            <Stack
              sx={{
                maxWidth: maxContentWidth,
                width: "100%",
              }}
            >
              <Typography
                align="left"
                className="decor-text"
                sx={{
                  fontSize: "1.5rem",
                  //fontWeight: 600,
                  color: "#222",
                }}
              >
                {item.exampleOfFirstMessageFromAi}
              </Typography>
            </Stack>
          </Stack>

          <CtaBlock />
        </Stack>
      </div>
      <Footer />
    </>
  );
};
