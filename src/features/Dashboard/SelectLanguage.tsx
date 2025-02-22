import { Stack, Typography } from "@mui/material";
import { StarContainer } from "../Layout/StarContainer";
import { LangSelector } from "../Lang/LangSelector";
import { useSettings } from "../Settings/useSettings";

export const SelectLanguage: React.FC = () => {
  const settings = useSettings();
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
          <Typography variant="h5">Select language to learn</Typography>
          <LangSelector
            value={settings.language}
            onDone={(lang) => settings.setLanguage(lang)}
            confirmButtonLabel="Continue"
          />
          <Typography variant="caption">
            You can change the language later in the settings
          </Typography>
        </Stack>
      </StarContainer>
    </Stack>
  );
};
