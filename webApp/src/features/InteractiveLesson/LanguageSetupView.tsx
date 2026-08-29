'use client';

import { useMemo } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { LangSelector } from '@/features/Lang/LangSelector';
import LanguageAutocomplete from '@/features/Lang/LanguageAutocomplete';
import { useLanguageGroup } from '@/features/Goal/useLanguageGroup';
import { SupportedLanguage, supportedLanguagesToLearn } from '@/features/Lang/lang';
import { NativeLangCode } from '@/libs/language/type';

export const LanguageSetupView = ({
  nativeLanguageCode,
  targetLanguageCode,
  onChangeNative,
  onChangeTarget,
  onContinue,
}: {
  nativeLanguageCode: NativeLangCode | null;
  targetLanguageCode: SupportedLanguage | null;
  onChangeNative: (languageCode: NativeLangCode) => void;
  onChangeTarget: (languageCode: SupportedLanguage) => void;
  onContinue: () => void;
}) => {
  const { i18n } = useLingui();
  const { languageGroups } = useLanguageGroup({
    defaultGroupTitle: i18n._('Other languages'),
    systemLanguagesTitle: i18n._('System languages'),
  });

  const selectedNativeLanguage = useMemo(
    () => languageGroups.find((lang) => lang.languageCode === nativeLanguageCode) || null,
    [languageGroups, nativeLanguageCode],
  );

  const canContinue =
    !!nativeLanguageCode && !!targetLanguageCode && nativeLanguageCode !== targetLanguageCode;

  return (
    <Stack sx={{ gap: '20px' }} data-testid="interactive-lesson-language-setup">
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        {i18n._('Choose your languages')}
      </Typography>
      <Typography variant="body1" sx={{ opacity: 0.85 }}>
        {i18n._(
          'This lesson needs two different languages: the one you already speak, and the one you want to practice.',
        )}
      </Typography>

      <Stack sx={{ gap: '8px' }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {i18n._('Native language')}
        </Typography>
        <LanguageAutocomplete
          options={languageGroups}
          value={selectedNativeLanguage}
          onChange={onChangeNative}
        />
      </Stack>

      <Stack sx={{ gap: '8px' }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {i18n._('Language to learn')}
        </Typography>
        <LangSelector
          value={targetLanguageCode}
          onChange={onChangeTarget}
          availableList={supportedLanguagesToLearn}
        />
      </Stack>

      <Button
        variant="contained"
        color="info"
        disabled={!canContinue}
        onClick={onContinue}
        data-testid="interactive-lesson-language-continue"
        sx={{ padding: '12px 24px', alignSelf: 'flex-start' }}
      >
        {i18n._('Continue')}
      </Button>
    </Stack>
  );
};
