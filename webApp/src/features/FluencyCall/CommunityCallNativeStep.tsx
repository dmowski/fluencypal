'use client';

import { useState } from 'react';
import { Button, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { Search, X } from 'lucide-react';
import { useLingui } from '@lingui/react';
import { LanguageButton } from '@/features/Lang/LangSelector';
import { useLanguageGroup } from '@/features/Goal/useLanguageGroup';
import { NativeLangCode } from '@/libs/language/type';

export const CommunityCallNativeStep = ({
  value,
  onChange,
  onContinue,
}: {
  value: string;
  onChange: (language: NativeLangCode) => void;
  onContinue: () => void;
}) => {
  const { i18n } = useLingui();
  const [filterValue, setFilterValue] = useState('');
  const cleanInput = filterValue.trim().toLowerCase();
  const { languageGroups } = useLanguageGroup({
    defaultGroupTitle: i18n._('Other languages'),
    systemLanguagesTitle: i18n._('System languages'),
  });
  const filtered = languageGroups.filter((option) => {
    if (!cleanInput) return true;
    return (
      option.englishName.toLowerCase().includes(cleanInput) ||
      option.nativeName.toLowerCase().includes(cleanInput)
    );
  });
  const systemLanguages = filtered.filter((option) => option.isSystemLanguage);
  const otherLanguages = filtered.filter((option) => !option.isSystemLanguage);

  return (
    <Stack data-testid="community-call-native" sx={{ gap: '14px', width: '100%' }}>
      <Typography variant="h4" sx={{ fontWeight: 800 }}>
        {i18n._('What language do you speak')}
      </Typography>
      <Typography sx={{ opacity: 0.75 }}>{i18n._('So I can translate words for you')}</Typography>
      <TextField
        value={filterValue}
        onChange={(event) => setFilterValue(event.target.value)}
        fullWidth
        variant="filled"
        label={i18n._('My Language is...')}
        autoComplete="off"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search size={18} />
              </InputAdornment>
            ),
            endAdornment: filterValue ? (
              <InputAdornment position="end">
                <IconButton aria-label={i18n._('Clear')} onClick={() => setFilterValue('')}>
                  <X size={16} />
                </IconButton>
              </InputAdornment>
            ) : null,
          },
        }}
      />
      {filtered.length === 0 ? (
        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          {i18n._('No results found')}
        </Typography>
      ) : null}
      <Stack sx={{ gap: '10px', maxHeight: '46vh', overflow: 'auto' }}>
        {systemLanguages.map((option) => (
          <LanguageButton
            key={option.languageCode}
            onClick={() => onChange(option.languageCode)}
            label={option.englishName}
            langCode={option.languageCode}
            englishFullName={option.englishName}
            isSystemLang={option.isSystemLanguage}
            fullName={option.nativeName}
            flagImageUrl={option.flag}
            isShowFullName
            isSelected={option.languageCode === value}
          />
        ))}
        {otherLanguages.map((option) => (
          <LanguageButton
            key={option.languageCode}
            onClick={() => onChange(option.languageCode)}
            label={option.englishName}
            langCode={option.languageCode}
            englishFullName={option.englishName}
            isSystemLang={option.isSystemLanguage}
            fullName={option.nativeName}
            flagImageUrl={option.flag}
            isShowFullName
            isSelected={option.languageCode === value}
          />
        ))}
      </Stack>
      <Button
        variant="contained"
        size="large"
        data-testid="community-call-next"
        data-analytics="community-call-native-continue"
        disabled={!value}
        onClick={onContinue}
        sx={{ alignSelf: 'flex-start', borderRadius: '30px', fontWeight: 700 }}
      >
        {i18n._('Continue')}
      </Button>
    </Stack>
  );
};
