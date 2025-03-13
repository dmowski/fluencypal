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
      <StarContainer minHeight="90vh" paddingBottom="0px">
        <Stack
          sx={{
            maxWidth: "400px",
            gap: "20px",
          }}
        >
          <Typography variant="h5">{i18n._(`Select language to learn`)}</Typography>
          <LangSelector
            value={settings.languageCode}
            onDone={(lang) => settings.setLanguage(lang)}
            confirmButtonLabel="Continue"
          />
          <Typography variant="caption">
            {i18n._(`You can change the language later in the settings`)}
          </Typography>
        </Stack>
      </StarContainer>
    </Stack>
  );
};
