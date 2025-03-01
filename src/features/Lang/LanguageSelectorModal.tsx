import { FC } from "react";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { Stack, Typography } from "@mui/material";
import { LangSelector } from "./LangSelector";
import { useSettings } from "../Settings/useSettings";

interface LanguageSelectorModalProps {
  onClose: () => void;
}
export const LanguageSelectorModal: FC<LanguageSelectorModalProps> = ({ onClose }) => {
  const settings = useSettings();

  return (
    <CustomModal isOpen={true} onClose={onClose} width="500px">
      <Stack>
        <Typography variant="h4" component="h2">
          Language to Learn
        </Typography>
        <Typography
          variant="caption"
          sx={{
            opacity: 0.7,
          }}
        >
          You can switch between languages and won't lose your progress
        </Typography>
      </Stack>
      <Stack
        sx={{
          width: "100%",
        }}
      >
        <LangSelector
          value={settings.languageCode}
          onDone={(lang) => {
            settings.setLanguage(lang);
            onClose();
          }}
          confirmButtonLabel="Save"
        />
      </Stack>
    </CustomModal>
  );
};
