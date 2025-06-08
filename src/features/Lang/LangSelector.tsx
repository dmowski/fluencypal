import {
  fullEnglishLanguageName,
  fullLanguageName,
  getLabelFromCode,
  getUserLangCode,
  langFlags,
  SupportedLanguage,
  supportedLanguages,
} from "@/features/Lang/lang";
import { JSX } from "react";
import { MenuItem, Select, Stack, Typography } from "@mui/material";

interface LangSelectorProps {
  value: SupportedLanguage | null;
  onChange: (selectedLang: SupportedLanguage) => void;
}

export const LangSelector = ({ value, onChange }: LangSelectorProps): JSX.Element => {
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
          return (
            <MenuItem
              key={option.langCode}
              value={option.langCode}
              sx={{
                padding: "20px",
              }}
            >
              <Stack
                sx={{
                  alignItems: "center",
                  display: "flex",
                  flexDirection: "row",
                  width: "100%",
                  justifyContent: "flex-start",
                  padding: "0px 5px",
                  gap: "15px",
                  minHeight: "42px",
                }}
              >
                <img
                  src={langFlags[option.langCode]}
                  alt={option.label}
                  style={{
                    width: "50px",
                    border: "1px solid rgba(0, 0, 0, 0.15)",
                    borderRadius: "1px",
                  }}
                />
                <Typography>{option.englishFullName}</Typography>
              </Stack>
            </MenuItem>
          );
        })}
      </Select>
    </Stack>
  );
};
