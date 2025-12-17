import { HeaderStatic } from "@/features/Header/HeaderStatic";
import { maxLandingWidth } from "@/features/Landing/landingSettings";
import { Button, Stack, Typography } from "@mui/material";
import { SupportedLanguage } from "../Lang/lang";
import { getI18nInstance } from "@/appRouterI18n";
import { getUrlStart } from "../Lang/getUrlStart";

export function NotFoundPage({ lang }: { lang: SupportedLanguage }) {
  const supportedLang = lang || "en";
  const i18n = getI18nInstance(supportedLang);

  const content = (
    <div>
      <HeaderStatic lang={supportedLang} />
      <Stack
        sx={{
          alignItems: "center",
          paddingTop: "120px",
        }}
      >
        <Stack
          sx={{
            maxWidth: maxLandingWidth,
            width: "100%",
            alignItems: "flex-start",
          }}
        >
          <Typography variant="h1">{i18n._(`Not Found`)}</Typography>
          <p>{i18n._(`Could not find page`)}</p>
          <Button
            variant="contained"
            href={`${getUrlStart(supportedLang)}`}
            sx={{
              padding: "20px 60px",
            }}
          >
            {i18n._(`Go to the main page`)}
          </Button>
        </Stack>
      </Stack>
    </div>
  );

  if (supportedLang === "en") {
    return (
      <html lang={supportedLang}>
        <body>{content}</body>
      </html>
    );
  }

  return content;
}
