'use client';

import { Box, MenuItem, Select } from '@mui/material';
import { useLingui } from '@lingui/react';
import { emojiLanguageName, fullLanguageName, SupportedLanguage } from '@/features/Lang/lang';
import { fluencyCallLanguageCode, fluencyCallLanguageOptions } from './callLanguage';

const iconOnlySelectSx = {
  '& .fluency-call-language-name': { display: 'none' },
  '& .MuiSelect-select': {
    padding: '6px 24px 6px 8px',
  },
};

export const FluencyCallLanguageSelect = ({
  value,
  onChange,
  testId,
  collapseLabel = false,
}: {
  value: SupportedLanguage;
  onChange: (language: SupportedLanguage) => void;
  testId: string;
  collapseLabel?: boolean;
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
      renderValue={(selectedCode) => {
        const code = fluencyCallLanguageCode(String(selectedCode));
        return (
          <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Box component="span" aria-hidden>
              {emojiLanguageName[code]}
            </Box>
            <Box component="span" className="fluency-call-language-name">
              {fullLanguageName[code]}
            </Box>
          </Box>
        );
      }}
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
          padding: '6px 28px 6px 10px',
          fontSize: '14px',
          fontWeight: 600,
        },
        '& .MuiSvgIcon-root': { color: '#b7d4e8' },
        ...(collapseLabel
          ? {
              '@media (max-width: 600px)': iconOnlySelectSx,
              '@container fluency-call-card (max-width: 520px)': iconOnlySelectSx,
            }
          : {}),
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
