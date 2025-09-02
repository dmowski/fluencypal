import {
  fullEnglishLanguageName,
  fullLanguageName,
  getLabelFromCode,
  getUserLangCode,
  langFlags,
  SupportedLanguage,
  supportedLanguages,
} from "@/features/Lang/lang";
import { JSX, useMemo } from "react";
import { MenuItem, Select, Stack, Typography } from "@mui/material";
import { CheckIcon } from "lucide-react";

interface LangSelectorProps {
  value: SupportedLanguage | null;
  onChange: (selectedLang: SupportedLanguage) => void;
  availableList?: SupportedLanguage[];
}

export const LangSelector = ({
  value,
  onChange,
  availableList,
}: LangSelectorProps): JSX.Element => {
  const userCodes = useMemo(() => getUserLangCode(), []);

  const optionsFull = (availableList || supportedLanguages)
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

export const LanguageButton = ({
  label,
  langCode,
  englishFullName,
  isSystemLang,
  fullName,
  isSelected,
  onClick,
  flagImageUrl,
}: {
  label: string;
  langCode: string;
  englishFullName: string;
  isSystemLang: boolean;
  fullName: string;
  isSelected: boolean;
  onClick: (langCode: string) => void;
  flagImageUrl?: string;
}) => {
  return (
    <Stack
      sx={{
        padding: "10px 12px",
        borderRadius: "8px",
        color: "#fff",
        outline: "none",
        cursor: "pointer",
        backgroundColor: isSelected ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.01)",
        border: isSelected ? "2px solid #1f74be" : "2px solid rgba(255, 255, 255, 0.03)",
        "&:hover": {
          backgroundColor: isSelected ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.05)",
        },
      }}
      component={"button"}
      onClick={() => onClick(langCode)}
    >
      <Stack
        sx={{
          alignItems: "center",
          display: "flex",
          flexDirection: "row",
          width: "100%",
          justifyContent: "space-between",
          padding: "0px 5px",
          gap: "15px",
          minHeight: "42px",
        }}
      >
        <Stack
          sx={{
            flexDirection: "row",
            alignItems: "center",
            gap: "14px",
          }}
        >
          {flagImageUrl && (
            <img
              src={flagImageUrl}
              alt={label}
              style={{
                width: "50px",
                border: "1px solid rgba(0, 0, 0, 0.15)",
                borderRadius: "1px",
              }}
            />
          )}
          <Typography>{englishFullName}</Typography>
        </Stack>

        {isSelected && (
          <Stack
            sx={{
              padding: "4px",
              backgroundColor: "#1f74be",
              borderRadius: "22px",
            }}
          >
            <CheckIcon size={"18px"} />
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};

export const LangSelectorFullScreen = ({
  value,
  onChange,
  availableList,
}: LangSelectorProps): JSX.Element => {
  const userCodes = useMemo(() => getUserLangCode(), []);

  const optionsFull = (availableList || supportedLanguages)
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
        gap: "4px",
      }}
    >
      {optionsFull.map((option) => {
        const isSelected = option.langCode === value;
        const flagImageUrl = langFlags[option.langCode];
        return (
          <LanguageButton
            onClick={() => onChangeLanguage(option.langCode)}
            key={option.langCode}
            label={option.label}
            langCode={option.langCode}
            englishFullName={option.englishFullName}
            isSystemLang={option.isSystemLang}
            fullName={option.fullName}
            isSelected={isSelected}
            flagImageUrl={flagImageUrl}
          />
        );
      })}
    </Stack>
  );
};
