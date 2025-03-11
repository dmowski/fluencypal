import { TalkingWaves } from "@/features/uiKit/Animations/TalkingWaves";
import { Stack, Typography } from "@mui/material";

import { maxContentWidth, subTitleFontStyle } from "../landingSettings";
import { Header } from "../../Header/Header";
import { Footer } from "../Footer";
import { ContactList } from "./ContactList";
import { SupportedLanguage } from "@/common/lang";
import { getI18nInstance } from "@/appRouterI18n";

interface ContactsPageProps {
  lang: SupportedLanguage;
}
export const ContactsPage = ({ lang }: ContactsPageProps) => {
  const i18n = getI18nInstance(lang);
  return (
    <Stack sx={{}}>
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
            paddingTop: "100px",
            color: "#000",
            minHeight: "calc(100vh - 300px)",
          }}
        >
          <Stack
            sx={{
              width: "100%",
              maxWidth: maxContentWidth,
              padding: "100px 20px 30px 20px",
              gap: "40px",
              alignItems: "center",
              boxSizing: "border-box",
            }}
          >
            <Stack
              sx={{
                width: "100%",
                alignItems: "flex-start",
                gap: "10px",
              }}
            >
              <Typography
                align="left"
                variant="h2"
                component={"h1"}
                sx={{
                  fontWeight: 700,
                  "@media (max-width: 1300px)": {
                    fontSize: "4rem",
                  },
                  "@media (max-width: 900px)": {
                    fontSize: "3rem",
                  },
                  "@media (max-width: 700px)": {
                    fontSize: "2rem",
                  },
                }}
              >
                {i18n._(`Contacts`)}
              </Typography>
              <Typography
                align="left"
                variant="body1"
                sx={{
                  maxWidth: "940px",
                  ...subTitleFontStyle,
                }}
              >
                {i18n._(
                  `Feel free to reach out to me with any questions or feedback. I'm always happy to help!`
                )}
              </Typography>
            </Stack>
          </Stack>

          <Stack
            sx={{
              width: "100%",
              maxWidth: maxContentWidth,
              padding: "0px 20px 100px 20px",
              gap: "40px",
              alignItems: "center",
              boxSizing: "border-box",
            }}
          >
            <Stack
              gap={"10px"}
              sx={{
                width: "100%",
                color: "#1f74be",
                a: {
                  color: "#1f74be",
                },
              }}
            >
              <ContactList />
            </Stack>
          </Stack>
        </Stack>
      </div>
      <Footer lang={lang} />
    </Stack>
  );
};
