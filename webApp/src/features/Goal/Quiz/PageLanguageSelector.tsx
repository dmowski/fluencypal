'use client';

import { Stack, Typography } from '@mui/material';
import {
  fullEnglishLanguageName,
  fullLanguageName,
  getLabelFromCode,
  getUserLangCode,
  langFlags,
  SupportedLanguage,
  supportedLanguages,
} from '@/features/Lang/lang';
import { useLingui } from '@lingui/react';
import { Globe } from 'lucide-react';
import { LanguageButton } from '@/features/Lang/LangSelector';
import { useQuiz } from './useQuiz';
import { useMemo } from 'react';
import { NextStepButton } from './NextStepButton';

export const PageLanguageSelector = () => {
  const { i18n } = useLingui();
  const { pageLanguage, setPageLanguage } = useQuiz();
  const value = pageLanguage;

  const userCodes = useMemo(() => getUserLangCode(), []);
  const availableList = supportedLanguages;
  const optionsFull = (availableList || supportedLanguages)
    .map((lang: SupportedLanguage) => {
      return {
        label: getLabelFromCode(lang),
        langCode: lang,
        englishFullName: fullEnglishLanguageName[lang] || '',
        isSystemLang: userCodes.includes(lang),
        fullName: fullLanguageName[lang] || '',
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  const onChangeLanguage = async (code: string) => {
    const isChanging = pageLanguage !== code;
    if (!isChanging) {
      return;
    }
    if (!code) {
      return;
    }

    const langCode = supportedLanguages.find((lang) => lang === code) || 'en';
    setPageLanguage(langCode);
  };
  return (
    <Stack
      sx={{
        gap: '20px',
      }}
    >
      <Stack
        sx={{
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
        }}
      >
        <Globe size={'30px'} />
        <Typography
          variant="h3"
          align="center"
          sx={{
            fontWeight: 500,
            fontSize: '1.1rem',
            boxSizing: 'border-box',
            lineHeight: '1.1',
          }}
        >
          {i18n._(`Page Language`)}
        </Typography>
      </Stack>

      <Stack
        sx={{
          width: '100%',
          gap: '4px',
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
              flagSize="small"
              isShowFullName
            />
          );
        })}
      </Stack>
      <NextStepButton />
    </Stack>
  );
};
