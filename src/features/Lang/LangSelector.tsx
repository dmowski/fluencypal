import {
  fullEnglishLanguageName,
  fullLanguageName,
  getLabelFromCode,
  getUserLangCode,
  SupportedLanguage,
  supportedLanguages,
} from "@/common/lang";
import { JSX, useEffect, useState } from "react";
import { MenuItem, Select, Stack, Typography } from "@mui/material";

interface LangSelectorProps {
  value: SupportedLanguage | null;
  onChange: (selectedLang: SupportedLanguage) => void;
}

export const LangSelector = ({ value, onChange }: LangSelectorProps): JSX.Element => {
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>("en");
  useEffect(() => {
    value && setSelectedLanguage(value);
  }, [value]);

  const userCodes = getUserLangCode();

  const optionsFull = supportedLanguages
    .map((lang: SupportedLanguage) => {
      return {
        label: getLabelFromCode(lang),
        langCode: lang,
        englishFullName: fullEnglishLanguageName[lang] || "",
        isSystemLang: userCodes.includes(lang),
        fullName: fullLanguageName[lang] || "",
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  const onChangeLanguage = async (code: string) => {
    const isChanging = value !== code;
    if (!isChanging) {
      return;
    }
    if (!code) {
      return;
    }

    const langCode = supportedLanguages.find((lang) => lang === code) || "en";
    onChange(langCode);
  };

  return (
    <Stack
      sx={{
        width: "100%",
        gap: "20px",
        color: "#323",
      }}
    >
      <Select
        value={value}
        variant="outlined"
        onChange={(e) => onChangeLanguage(e.target.value || "")}
      >
        {optionsFull.map((option) => {
          const isSameLabels = option.englishFullName === option.fullName;
          return (
            <MenuItem key={option.langCode} value={option.langCode}>
              {isSameLabels ? <>{option.englishFullName}</> : <>{option.englishFullName}</>}
            </MenuItem>
          );
        })}
      </Select>
    </Stack>
  );
};
