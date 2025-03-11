import { Button, Link, Stack, Typography } from "@mui/material";
import {
  buttonStyle,
  maxLandingWidth,
  subTitleFontStyle,
  titleFontStyle,
} from "../landingSettings";
import { getRolePlayScenarios } from "../../RolePlay/rolePlayData";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { RolePlayScroller } from "./RolePlayScroller";
import { RolePlayCard } from "./RolePlayCard";
import { SupportedLanguage } from "@/common/lang";

interface RolePlayDemoProps {
  title: string;
  subTitle: string;
  actionButtonTitle: string;
  footerLabel: string;
  footerLinkTitle: string;
  importantRolesTitleAfterFooter: string;
  lang: SupportedLanguage;
}

export const RolePlayDemo = ({
  title,
  subTitle,
  actionButtonTitle,
  footerLabel,
  footerLinkTitle,
  importantRolesTitleAfterFooter,
  lang,
}: RolePlayDemoProps) => {
  const rolePlayScenarios = getRolePlayScenarios(lang);
  const importantRoles = rolePlayScenarios.filter((scenario) => scenario.landingHighlight);

  return (
    <Stack
      sx={{
        width: "100%",
        padding: "50px 0 120px 0",
        alignItems: "center",
        justifyContent: "center",
        gap: "100px",
        backgroundColor: `rgb(255, 253, 249, 1)`,
        position: "relative",
        zIndex: 1,
        overflow: "hidden",
      }}
    >
      <Stack
        sx={{
          alignItems: "center",
          gap: "50px",
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
              color: "#000",
            }}
          >
            {title}
          </Typography>
          <Typography
            align="center"
            variant="body1"
            sx={{
              maxWidth: "810px",
              color: "#000",
              ...subTitleFontStyle,
            }}
          >
            {subTitle}
          </Typography>
        </Stack>
        <Stack
          sx={{
            gap: "20px",
            maxWidth: maxLandingWidth,
            boxSizing: "border-box",
            alignItems: "center",
            padding: "0 10px",
          }}
        >
          <Stack
            sx={{
              width: "100vw",
              height: "410px",
              overflow: "hidden",
            }}
          >
            <Stack
              sx={{
                maxWidth: "100vw",
                height: "500px",
                overflowY: "hidden",
                overflowX: "auto",
                paddingBottom: "40px",
                paddingTop: "10px",
                scrollbarWidth: "none",
              }}
              id="role-play-scenarios-scroller"
            >
              <Stack
                sx={{
                  gap: "30px",
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  width: "max-content",
                  "@media (max-width: 400px)": {
                    gap: "10px",
                  },
                }}
              >
                {rolePlayScenarios
                  .filter((scenario) => !scenario.landingHighlight)
                  .map((scenario, index) => {
                    return (
                      <Stack
                        key={index}
                        sx={{
                          maxWidth: "400px",
                        }}
                      >
                        <RolePlayCard key={index} scenario={scenario} lang={lang} height="400px" />
                      </Stack>
                    );
                  })}
              </Stack>
            </Stack>
          </Stack>
          <RolePlayScroller />
          <Stack
            sx={{
              alignItems: "center",
              color: "#000",
              paddingTop: "30px",
              gap: "50px",
            }}
          >
            <Button
              size="large"
              sx={{
                ...buttonStyle,
              }}
              href="/scenarios"
              color="info"
              variant="contained"
            >
              {actionButtonTitle}
            </Button>
            <Stack
              sx={{
                alignItems: "center",
                gap: "0px",
              }}
            >
              <Typography
                variant="h6"
                component={"p"}
                sx={{
                  fontWeight: 320,
                }}
              >
                {footerLabel}
              </Typography>

              <Link
                sx={{
                  color: "#000",
                  textDecoration: "none",
                  padding: "10px 20px",
                }}
                href={`/${lang}/practice`}
              >
                <Stack
                  sx={{
                    alignItems: "center",
                    justifyContent: "flex-start",
                    flexDirection: "row",
                    gap: "5px",
                  }}
                >
                  <Typography
                    sx={{
                      textDecoration: "underline",
                      textUnderlineOffset: "8px",
                      fontWeight: 500,
                    }}
                    variant="h6"
                    component={"span"}
                    className="link-text"
                  >
                    {footerLinkTitle}
                  </Typography>
                  <ArrowForwardIcon
                    className="link-icon"
                    sx={{
                      position: "relative",
                      left: "0px",
                      fontSize: "16px",
                      transition: "left 0.3s",
                    }}
                  />
                </Stack>
              </Link>
            </Stack>
          </Stack>
        </Stack>

        <Stack
          sx={{
            gap: "20px",
            maxWidth: maxLandingWidth,
            boxSizing: "border-box",
            alignItems: "center",
            padding: "80px 10px 0 10px",
          }}
        >
          <Typography
            align="center"
            variant="h3"
            component={"h2"}
            sx={{
              ...titleFontStyle,
              color: "#000",
            }}
          >
            {importantRolesTitleAfterFooter}
          </Typography>
          <Typography
            align="center"
            variant="body1"
            sx={{
              maxWidth: "810px",
              color: "#000",
              ...subTitleFontStyle,
            }}
          ></Typography>

          <Stack
            sx={{
              display: "grid",
              gap: "20px",
              padding: "0 10px",
              gridTemplateColumns: "1fr 1fr 1fr",
              "@media (max-width: 900px)": {
                gridTemplateColumns: "1fr",
                gap: "50px",
              },
            }}
          >
            {importantRoles.map((scenario, index) => {
              return (
                <RolePlayCard
                  key={index}
                  scenario={scenario}
                  variant="highlight"
                  lang={lang}
                  height={"100%"}
                />
              );
            })}
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};
