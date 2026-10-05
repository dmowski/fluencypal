'use client';

import { useState } from 'react';
import { useLingui } from '@lingui/react';
import {
  Box,
  ButtonBase,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { Check, ChevronRight, Globe2, X } from 'lucide-react';
import {
  fullEnglishLanguageName,
  supportedLanguages,
  SupportedLanguage,
} from '@/features/Lang/lang';

const featuredLanguages: SupportedLanguage[] = ['en', 'es', 'fr', 'de'];

export const DemoLanguageCards = ({
  language,
  onChange,
}: {
  language: SupportedLanguage;
  onChange: (language: SupportedLanguage) => void;
}) => {
  const { i18n } = useLingui();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreSelected = !featuredLanguages.includes(language);
  const cardStyle = (selected: boolean) => ({
    position: 'relative',
    border: '1px solid',
    borderColor: selected ? '#bf9cff' : 'rgba(255,255,255,.14)',
    borderRadius: '18px',
    background: selected ? 'linear-gradient(145deg, #513672, #30233f)' : 'rgba(255,255,255,.035)',
    color: '#fff',
    transition: 'background 150ms, border-color 150ms',
    '&:hover': { backgroundColor: 'rgba(191,156,255,.12)', borderColor: '#bf9cff' },
    '&.Mui-focusVisible': { outline: '3px solid #dfccff', outlineOffset: '3px' },
  });
  return (
    <Stack sx={{ gap: 1.5 }}>
      <Typography id="demo-language-label" sx={{ fontSize: 14, fontWeight: 600, color: '#d6cce2' }}>
        {i18n._('I want to practice')}
      </Typography>
      <Box
        role="group"
        aria-labelledby="demo-language-label"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(5, minmax(0, 1fr))' },
          gap: 1.25,
        }}
      >
        {featuredLanguages.map((code) => (
          <ButtonBase
            key={code}
            aria-label={fullEnglishLanguageName[code]}
            aria-pressed={language === code}
            onClick={() => onChange(code)}
            sx={{
              ...cardStyle(language === code),
              minHeight: 106,
              px: 1,
              py: 2,
              flexDirection: 'column',
              gap: 1.25,
            }}
          >
            {language === code ? (
              <Check
                size={14}
                aria-hidden="true"
                style={{ position: 'absolute', top: 10, right: 10, color: '#dfccff' }}
              />
            ) : null}
            <Typography
              component="span"
              aria-hidden="true"
              sx={{
                fontSize: 23,
                fontWeight: 700,
                letterSpacing: '.04em',
                color: language === code ? '#eadbff' : '#cbb9dd',
              }}
            >
              {code.toUpperCase()}
            </Typography>
            <Typography
              component="span"
              sx={{ fontSize: 14, fontWeight: language === code ? 600 : 400 }}
            >
              {fullEnglishLanguageName[code]}
            </Typography>
          </ButtonBase>
        ))}
        <ButtonBase
          aria-label={i18n._('More languages')}
          aria-haspopup="dialog"
          onClick={() => setMoreOpen(true)}
          sx={{
            ...cardStyle(moreSelected),
            gridColumn: { xs: '1 / -1', sm: 'auto' },
            minHeight: { xs: 54, sm: 106 },
            px: 1.5,
            py: 1.5,
            flexDirection: { xs: 'row', sm: 'column' },
            gap: 1,
          }}
        >
          {moreSelected ? (
            <Typography component="span" sx={{ fontSize: 20, fontWeight: 700, color: '#eadbff' }}>
              {language.toUpperCase()}
            </Typography>
          ) : (
            <Globe2 size={23} aria-hidden="true" color="#cbb9dd" />
          )}
          <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
            <Typography component="span" sx={{ fontSize: 14 }}>
              {moreSelected ? fullEnglishLanguageName[language] : i18n._('More')}
            </Typography>
            <ChevronRight size={14} aria-hidden="true" />
          </Stack>
        </ButtonBase>
      </Box>
      <Dialog
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        fullWidth
        maxWidth="xs"
        aria-labelledby="demo-more-languages"
        slotProps={{
          paper: {
            sx: { borderRadius: '24px', background: '#1b1427', border: '1px solid #493656' },
          },
        }}
      >
        <DialogTitle id="demo-more-languages" sx={{ pr: 7 }}>
          {i18n._('Choose your practice language')}
        </DialogTitle>
        <IconButton
          aria-label={i18n._('Close')}
          onClick={() => setMoreOpen(false)}
          sx={{ position: 'absolute', right: 12, top: 12 }}
        >
          <X size={20} />
        </IconButton>
        <DialogContent
          sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1, pb: 3 }}
        >
          {supportedLanguages.map((code) => (
            <ButtonBase
              key={code}
              aria-label={fullEnglishLanguageName[code]}
              aria-pressed={language === code}
              onClick={() => {
                onChange(code);
                setMoreOpen(false);
              }}
              sx={{
                ...cardStyle(language === code),
                minHeight: 56,
                justifyContent: 'flex-start',
                px: 1.5,
                gap: 1.25,
              }}
            >
              <Typography
                component="span"
                sx={{ fontSize: 12, fontWeight: 700, color: '#cbb9dd', minWidth: 22 }}
              >
                {code.toUpperCase()}
              </Typography>
              <Typography component="span" sx={{ fontSize: 14 }}>
                {fullEnglishLanguageName[code]}
              </Typography>
            </ButtonBase>
          ))}
        </DialogContent>
      </Dialog>
    </Stack>
  );
};
