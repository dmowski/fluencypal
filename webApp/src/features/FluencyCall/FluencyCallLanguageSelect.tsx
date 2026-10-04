'use client';

import { MenuItem, Select } from '@mui/material';
import { useLingui } from '@lingui/react';
import { emojiLanguageName, fullLanguageName, SupportedLanguage } from '@/features/Lang/lang';
import { fluencyCallLanguageCode, fluencyCallLanguageOptions } from './callLanguage';

export const FluencyCallLanguageSelect = ({
  value,
  onChange,
  testId,
}: {
  value: SupportedLanguage;
  onChange: (language: SupportedLanguage) => void;
  testId: string;
}) => {
  const { i18n } = useLingui();
  const selected = fluencyCallLanguageCode(value);
  const options = fluencyCallLanguageOptions();

  return (
    <Select
      size="small"
      value={selected}
      data-testid={testId}
      aria-label={i18n._('Language')}
      onChange={(event) => onChange(fluencyCallLanguageCode(String(event.target.value)))}
      sx={{
        flexShrink: 0,
        width: 'fit-content',
        maxWidth: 180,
        height: 36,
        color: '#e7eef4',
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        borderRadius: '10px',
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: 'rgba(255, 255, 255, 0.16)',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: 'rgba(183, 212, 232, 0.45)',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: 'rgba(183, 212, 232, 0.45)',
        },
        '& .MuiSelect-select': {
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 28px 6px 10px',
          fontSize: '14px',
          fontWeight: 600,
        },
        '& .MuiSvgIcon-root': { color: '#b7d4e8' },
      }}
    >
      {options.map((code) => (
        <MenuItem key={code} value={code}>
          {emojiLanguageName[code]} {fullLanguageName[code]}
        </MenuItem>
      ))}
    </Select>
  );
};
