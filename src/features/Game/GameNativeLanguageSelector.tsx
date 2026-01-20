import { useLingui } from "@lingui/react";
import { IconButton, Stack, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { useSettings } from "../Settings/useSettings";
import { useLanguageGroup } from "../Goal/useLanguageGroup";
import { PencilIcon } from "lucide-react";
import LanguageAutocomplete from "../Lang/LanguageAutocomplete";

export const GameNativeLanguageSelector = () => {
  const settings = useSettings();
  const { i18n } = useLingui();
  const [isShowLangSelectorState, setIsShowLangSelector] = useState(false);

  const nativeLang = settings.userSettings?.nativeLanguageCode;

  const isNativeLanguageIsTheSameAsGameLanguage =
    nativeLang === settings.languageCode;

  const { languageGroups } = useLanguageGroup({
    defaultGroupTitle: i18n._(`Other languages`),
    systemLanguagesTitle: i18n._(`System languages`),
  });

  const selectedNativeLanguage = useMemo(
    () => languageGroups.find((lang) => lang.languageCode === nativeLang),
    [languageGroups, nativeLang],
  );

  const nativeLanguageFullName = selectedNativeLanguage?.nativeName;
  const isShowLangSelector =
    isShowLangSelectorState || isNativeLanguageIsTheSameAsGameLanguage;

  return (
    <Stack
      sx={{
        gap: "5px",
        width: "100%",
        alignItems: "center",
      }}
    >
      <Typography variant="body2">
        {!isShowLangSelector && (
          <Stack
            component={"span"}
            sx={{
              width: "20px",
              display: "inline-block",
            }}
          />
        )}
        {i18n._("Your Native Language:")}
        {!isShowLangSelector ? " " + nativeLanguageFullName : ""}
        {!isShowLangSelector && (
          <IconButton
            size="small"
            onClick={() => setIsShowLangSelector(!isShowLangSelector)}
          >
            <PencilIcon size={"11px"} />
          </IconButton>
        )}
      </Typography>

      {isShowLangSelector && (
        <LanguageAutocomplete
          options={languageGroups}
          value={selectedNativeLanguage || null}
          onChange={(langCode) => settings.setNativeLanguage(langCode)}
        />
      )}
    </Stack>
  );
};
