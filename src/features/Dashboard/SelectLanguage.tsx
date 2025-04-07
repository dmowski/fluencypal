import { Stack, Typography } from "@mui/material";
import { StarContainer } from "../Layout/StarContainer";
import { LangSelector } from "../Lang/LangSelector";
import { useSettings } from "../Settings/useSettings";
import { useLingui } from "@lingui/react";

export const SelectLanguage: React.FC = () => {
  const settings = useSettings();
  const { i18n } = useLingui();

  return (
    <Stack
      sx={{
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <StarContainer minHeight="90vh" paddingBottom="100px">
        <Stack
          sx={{
            maxWidth: "650px",
            alignItems: "center",
            gap: "30px",
          }}
        >
          <Stack
            sx={{
              alignItems: "center",
              gap: "5px",
              width: "100%",
            }}
          >
            <Typography
              align="center"
              sx={{
                textTransform: "uppercase",
                fontWeight: 350,
                opacity: 0.9,
              }}
            >
              {i18n._(`Almost there!`)} | {settings.userCreatedAt} | {settings.languageCode} |
            </Typography>
            <Typography
              variant="h3"
              align="center"
              sx={{
                fontWeight: 900,
                fontSize: "2.6rem",
                padding: "0 20px",
                boxSizing: "border-box",
                lineHeight: "1.1",
              }}
            >
              {i18n._(`Select language to learn`)}
            </Typography>
          </Stack>
          <Stack
            sx={{
              alignItems: "center",
              width: "100%",
              gap: "5px",
              maxWidth: "350px",
            }}
          >
            <LangSelector
              value={settings.languageCode}
              onDone={(lang) => settings.setLanguage(lang)}
              confirmButtonLabel={i18n._(`Continue`)}
            />
            <Typography align="center" sx={{}} variant="caption">
              {i18n._(`You can switch the language anytime`)}
            </Typography>
          </Stack>
        </Stack>
      </StarContainer>
    </Stack>
  );
};
