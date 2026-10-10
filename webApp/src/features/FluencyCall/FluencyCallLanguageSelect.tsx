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
  appearance = 'default',
}: {
  value: SupportedLanguage;
  onChange: (language: SupportedLanguage) => void;
  testId: string;
  collapseLabel?: boolean;
  appearance?: 'default' | 'quiet';
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
      MenuProps={{
        slotProps: {
          paper: {
            sx: {
              backgroundColor: appearance === 'quiet' ? '#16181F' : undefined,
              backgroundImage: appearance === 'quiet' ? 'none' : undefined,
              color: appearance === 'quiet' ? '#EDF0F8' : undefined,
              '& .MuiMenuItem-root': {
                color: appearance === 'quiet' ? '#EDF0F8' : undefined,
              },
            },
          },
        },
      }}
      sx={{
        flexShrink: 0,
        width: 'fit-content',
        maxWidth: 180,
        height: appearance === 'quiet' ? 34 : 36,
        color: appearance === 'quiet' ? '#EDF0F8' : '#e7eef4',
        backgroundColor: appearance === 'quiet' ? 'transparent' : 'rgba(255, 255, 255, 0.04)',
        borderRadius: appearance === 'quiet' ? '9px' : '10px',
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: appearance === 'quiet' ? '#323644' : 'rgba(255, 255, 255, 0.16)',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: appearance === 'quiet' ? '#C4BAFF' : 'rgba(183, 212, 232, 0.45)',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: appearance === 'quiet' ? '#C4BAFF' : 'rgba(183, 212, 232, 0.45)',
        },
        '& .MuiSelect-select': {
          display: 'flex',
          alignItems: 'center',
          padding: appearance === 'quiet' ? '4px 28px 4px 10px' : '6px 28px 6px 10px',
          fontSize: appearance === 'quiet' ? '13px' : '14px',
          fontWeight: 600,
          color: 'inherit',
        },
        '& .MuiSvgIcon-root': { color: appearance === 'quiet' ? '#A8AFC0' : '#b7d4e8' },
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
