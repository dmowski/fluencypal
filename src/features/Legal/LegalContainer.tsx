import { SupportedLanguage } from "@/features/Lang/lang";
import { Button, ButtonGroup, Stack } from "@mui/material";
import { getUrlStart } from "../Lang/getUrlStart";
import { getI18nInstance } from "@/appRouterI18n";

interface LegalContainerProps {
  children: React.ReactNode;
  page: "privacy" | "terms" | "cookies";
  lang: SupportedLanguage;
}

export const LegalContainer = ({
  children,
  page,
  lang,
}: LegalContainerProps) => {
  const isCookies = page === "cookies";
  const isTerms = page === "terms";
  const isPrivacy = page === "privacy";
  const i18n = getI18nInstance(lang);

  const switcher = (
    <ButtonGroup
      sx={{
        position: "relative",
        zIndex: 2,
      }}
    >
      <Button
        variant={isTerms ? "contained" : "outlined"}
        href={`${getUrlStart(lang)}terms`}
      >
        {i18n._(`Terms of Use`)}
      </Button>
      <Button
        variant={isPrivacy ? "contained" : "outlined"}
        href={`${getUrlStart(lang)}privacy`}
      >
        {i18n._(`Privacy Policy`)}
      </Button>
      <Button
        variant={isCookies ? "contained" : "outlined"}
        href={`${getUrlStart(lang)}cookies`}
      >
        {i18n._(`Cookies Policy`)}
      </Button>
    </ButtonGroup>
  );
  return (
    <Stack
      component={"main"}
      sx={{
        width: "100%",
        maxWidth: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "80px 0 60px 0",
        gap: "30px",
        boxSizing: "border-box",
      }}
    >
      {switcher}
      <Stack
        sx={{
          gap: "10px",
          maxWidth: "900px",
          backgroundColor: "rgba(22, 22, 23, 0.8)",
          padding: "20px 20px 40px 20px",
          border: "1px solid #000",
          borderRadius: "5px",
          boxSizing: "border-box",
          width: "100%",
          a: {
            color: "rgba(44, 174, 255, 0.9)",
          },
        }}
      >
        {children}
      </Stack>
      {switcher}
    </Stack>
  );
};
