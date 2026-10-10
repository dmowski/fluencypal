'use client';

import { useState } from 'react';
import { useLingui } from '@lingui/react';
import { ButtonBase, Menu, MenuItem, Stack, Typography } from '@mui/material';
import { Check, ChevronDown } from 'lucide-react';
import {
  emojiLanguageName,
  fullEnglishLanguageName,
  supportedLanguagesToLearn,
  SupportedLanguage,
} from '@/features/Lang/lang';

const menuItemSx = {
  gap: 1.25,
  minHeight: 40,
  mx: 0.5,
  borderRadius: '10px',
  color: '#fff',
  '&:hover': { backgroundColor: 'rgba(191,156,255,.12)' },
  '&.Mui-selected': { backgroundColor: 'rgba(81,54,114,.95)' },
  '&.Mui-selected:hover': { backgroundColor: 'rgba(81,54,114,1)' },
  '&.Mui-focusVisible': { outline: '2px solid #dfccff', outlineOffset: -2 },
};

export const DemoLanguageCards = ({
  language,
  onChange,
}: {
  language: SupportedLanguage;
  onChange: (language: SupportedLanguage) => void;
}) => {
  const { i18n } = useLingui();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const close = () => setAnchorEl(null);

  return (
    <Stack sx={{ gap: 0.75, maxWidth: 220 }}>
      <Typography
        id="demo-language-label"
        component="label"
        htmlFor="demo-language-trigger"
        sx={{ fontSize: 13, fontWeight: 600, color: '#d6cce2' }}
      >
        {i18n._('I want to practice')}
      </Typography>
      <ButtonBase
        id="demo-language-trigger"
        aria-label={fullEnglishLanguageName[language]}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? 'demo-language-menu' : undefined}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        sx={{
          justifyContent: 'space-between',
          width: '100%',

          minHeight: 44,
          px: 1.5,
          border: '1px solid',
          borderColor: open ? '#bf9cff' : 'rgba(255,255,255,.14)',
          borderRadius: '14px',
          background: open ? 'rgba(191,156,255,.12)' : 'rgba(255,255,255,.035)',
          color: '#fff',
          transition: 'background 150ms, border-color 150ms',
          '&:hover': { backgroundColor: 'rgba(191,156,255,.12)', borderColor: '#bf9cff' },
          '&.Mui-focusVisible': { outline: '3px solid #dfccff', outlineOffset: '3px' },
        }}
      >
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1.25 }}>
          <Typography component="span" aria-hidden="true" sx={{ fontSize: 18, lineHeight: 1 }}>
            {emojiLanguageName[language]}
          </Typography>
          <Typography component="span" sx={{ fontSize: 15, fontWeight: 600 }}>
            {fullEnglishLanguageName[language]}
          </Typography>
        </Stack>
        <ChevronDown
          size={18}
          aria-hidden="true"
          style={{
            color: '#dfccff',
            transform: open ? 'rotate(180deg)' : undefined,
            transition: 'transform 150ms',
          }}
        />
      </ButtonBase>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          list: {
            id: 'demo-language-menu',
            'aria-labelledby': 'demo-language-label',
            sx: { py: 0.5 },
          },
          paper: {
            sx: {
              width: anchorEl?.clientWidth,
              mt: 0.75,
              maxHeight: 320,
              borderRadius: '14px',
              background: '#1b1427',
              backgroundImage: 'none',
              border: '1px solid #493656',
              color: '#fff',
            },
          },
        }}
      >
        {supportedLanguagesToLearn.map((code) => (
          <MenuItem
            key={code}
            selected={language === code}
            aria-label={fullEnglishLanguageName[code]}
            onClick={() => {
              onChange(code);
              close();
            }}
            sx={menuItemSx}
          >
            <Typography component="span" aria-hidden="true" sx={{ fontSize: 18, lineHeight: 1 }}>
              {emojiLanguageName[code]}
            </Typography>
            <Typography component="span" sx={{ flex: 1, fontSize: 14 }}>
              {fullEnglishLanguageName[code]}
            </Typography>
            {language === code ? <Check size={14} aria-hidden="true" color="#dfccff" /> : null}
          </MenuItem>
        ))}
      </Menu>
    </Stack>
  );
};
