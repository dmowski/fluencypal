import { TalkingWaves } from "@/features/uiKit/Animations/TalkingWaves";
import { Button, Stack, Typography } from "@mui/material";
import { Header } from "../Header/Header";

import { Footer } from "../Landing/Footer";

import { CtaBlock } from "../Landing/ctaBlock";
import {
  buttonStyle,
  maxContentWidth,
  subTitleFontStyle,
  titleFontStyle,
} from "../Landing/landingSettings";
import { Markdown } from "@/features/uiKit/Markdown/Markdown";
import { SupportedLanguage } from "@/common/lang";
import { getI18nInstance } from "@/appRouterI18n";
import { getUrlStart } from "@/features/Lang/getUrlStart";
import { getBlogs } from "./blogData";

interface BlogOnePageProps {
  id?: string;
  lang: SupportedLanguage;
}

export const BlogOnePage = ({ id, lang }: BlogOnePageProps) => {
  const i18n = getI18nInstance(lang);
  const blogs = getBlogs(lang);
  const item = blogs.find((scenario) => scenario.id === id);
  if (!item) {
    return null;
  }

  return (
    <>
      <Header mode="landing" lang={lang} />
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
                  href={`${getUrlStart(lang)}blog`}
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
                  {i18n._(`View all posts`)}
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
                  src={item.imagePreviewUrl}
                  alt={`Illustration for ${item.title}`}
                  style={{
                    width: "max-content",
                    maxWidth: "100%",
                    height: "400px",
                    borderRadius: "20px 20px 0 0",
                    boxShadow: "0px 0px 20px 0px rgba(0,0,0,0.3)",
                    position: "relative",
                  }}
                />
                <Stack
                  sx={{
                    backgroundImage: `url(${item.imagePreviewUrl})`,
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
                  <Markdown size="small">{`${item.content}`}</Markdown>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </Stack>

        <CtaBlock
          title={i18n._(`You can try AI in action now`)}
          actionButtonTitle={i18n._(`Try for free`)}
          actionButtonLink={`${getUrlStart(lang)}practice`}
        />
      </div>
      <Footer lang={lang} />
    </>
  );
};
