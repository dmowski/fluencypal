import {
  getLabelFromCode,
  getUserLangCode,
  SupportedLanguage,
  supportedLanguages,
} from "@/common/lang";
import { JSX, useEffect, useState } from "react";
import SuggestInput, { SelectGroupItem } from "../uiKit/SuggestInput/SuggestInput";
import { Button, Stack } from "@mui/material";

interface LangSelectorProps {
  value: SupportedLanguage | null;
  onChange: (selectedLang: SupportedLanguage) => void;
}

export const LangSelector = ({ value, onChange }: LangSelectorProps): JSX.Element => {
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>("en");
  useEffect(() => {
    value && setSelectedLanguage(value);
  }, [value]);

  const currentLangCode = selectedLanguage;
  const currentLang = getLabelFromCode(currentLangCode);

  const optionsFull = supportedLanguages
    .map((lang: SupportedLanguage) => {
      return { label: getLabelFromCode(lang), value: lang };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  const userCodes = getUserLangCode();
  const groups: SelectGroupItem[] = [];

  userCodes.forEach((code) => {
    const value = optionsFull.find((option) => option.value === code)?.label;
    if (!value) return;
    const groupTitle = `System languages`;
    groups.push({ value, groupTitle });
  });

  optionsFull.forEach((option) => {
    const isUserLang = userCodes.includes(option.value);
    if (isUserLang) return;
    const groupTitle = `Other languages`;
    groups.push({ value: option.label, groupTitle });
  });

  const options = groups.map((group) => group.value);

  const onChangeLanguage = async (newValue: string) => {
    const isChanging = value !== newValue;
    if (!isChanging) {
      return;
    }
    if (!newValue) {
      return;
    }
    const code = optionsFull.find((option) => option.label === newValue)?.value;
    if (!code) {
      return;
    }
    onChange(code);
  };

  return (
    <Stack
      sx={{
        width: "100%",
        gap: "20px",
      }}
    >
      <SuggestInput
        strict
        options={options}
        label={``}
        value={currentLang}
        onChange={onChangeLanguage}
        groups={userCodes.length > 0 ? groups : undefined}
      />
    </Stack>
  );
};
