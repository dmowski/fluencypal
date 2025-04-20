import { Link, Stack, Typography } from "@mui/material";

import { maxContentWidth, subTitleFontStyle } from "../landingSettings";

import { Footer } from "../Footer";
import { ContactList } from "./ContactList";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getI18nInstance } from "@/appRouterI18n";
import { getUrlStart } from "@/features/Lang/getUrlStart";
import { HeaderStatic } from "@/features/Header/HeaderStatic";

interface ContactsPageProps {
  lang: SupportedLanguage;
}
export const ContactsPage = ({ lang }: ContactsPageProps) => {
  const i18n = getI18nInstance(lang);
  return (
    <Stack sx={{}}>
      <HeaderStatic lang={lang} />

      <div
        style={{
          width: "100%",
          margin: 0,
        }}
      >
        <Stack
          component={"main"}
          sx={{
            alignItems: "center",
            width: "100%",
            backgroundColor: `#fff`,
            paddingTop: "100px",
            paddingBottom: "40px",
            color: "#000",
            height: "max-content",
            minHeight: "600px",
            maxHeight: "2000px",
            position: "relative",
            ".contactIll": {
              width: "300px",
              height: "auto",
              position: "absolute",
              bottom: "-10px",
              right: "0px",
              "@media (max-width: 1000px)": {
                width: "200px",
              },
              "@media (max-width: 600px)": {
                width: "150px",
              },
              "@media (max-width: 400px)": {
                display: "none",
              },
            },
          }}
        >
          <img src="/contactIll.jpg" alt="Contact" className="contactIll" />

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
                  maxWidth: "700px",
                  ...subTitleFontStyle,
                }}
              >
                {i18n._(
                  `My name is Alex, I am the creator of this website. I am a software engineer and I am passionate about learning languages. I created this website to help people learn languages in a fun and interactive way. I hope you enjoy using it!`
                )}
              </Typography>

              <Typography
                align="left"
                variant="body1"
                sx={{
                  maxWidth: "700px",
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
              gap={"30px"}
              sx={{
                width: "100%",
                color: "#1f74be",
                paddingBottom: "140px",
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
