'use client';

import { useLingui } from '@lingui/react';
import { Button, IconButton, Stack, TextField, Typography } from '@mui/material';
import { Volume2, X } from 'lucide-react';
import { useMemo } from 'react';
import LanguageAutocomplete, { SelectGroupItem } from '@/features/Lang/LanguageAutocomplete';
import { LoadingShapes } from '@/features/uiKit/Loading/LoadingShapes';
import { fullLanguagesList } from '@/libs/language/languages';
import { NativeLangCode } from '@/libs/language/type';
import { UsageExamplesState } from './types';

export const TranslationColumn = ({
  language,
  languages,
  text,
  isTranslating,
  isSpeaking,
  canRemove,
  examples,
  onChangeText,
  onPasteText,
  onChangeLanguage,
  onRemove,
  onPlay,
  onGiveExamples,
  onFocus,
  onBlur,
  onHoverStart,
  onHoverEnd,
}: {
  language: NativeLangCode;
  languages: NativeLangCode[];
  text: string;
  isTranslating: boolean;
  isSpeaking: boolean;
  canRemove: boolean;
  examples: UsageExamplesState | undefined;
  onChangeText: (value: string) => void;
  onPasteText: (value: string) => void;
  onChangeLanguage: (nextLanguage: NativeLangCode) => void;
  onRemove: () => void;
  onPlay: () => void;
  onGiveExamples: () => void;
  onFocus: () => void;
  onBlur: () => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}) => {
  const { i18n } = useLingui();

  const languageOptions = useMemo((): SelectGroupItem[] => {
    return fullLanguagesList
      .filter((item) => item.languageCode === language || !languages.includes(item.languageCode))
      .sort((left, right) => left.englishName.localeCompare(right.englishName))
      .map((item) => ({ ...item, groupTitle: i18n._('Languages') }));
  }, [i18n, language, languages]);

  const selectedLanguage = languageOptions.find((item) => item.languageCode === language) || null;

  return (
    <Stack
      data-testid={`translation-column-${language}`}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      sx={{
        flex: '1 1 280px',
        minWidth: '260px',
        gap: '10px',
        padding: '12px',
        borderRadius: '12px',
        border: isSpeaking
          ? '1px solid rgba(41, 182, 246, 0.8)'
          : '1px solid rgba(255,255,255,0.12)',
        backgroundColor: 'rgba(255,255,255,0.03)',
        minHeight: '100%',
      }}
    >
      <Stack
        sx={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: '8px',
        }}
      >
        <LanguageAutocomplete
          id={`translation-language-${language}`}
          options={languageOptions}
          value={selectedLanguage}
          onChange={onChangeLanguage}
        />
        <IconButton
          aria-label={i18n._('Play')}
          onClick={onPlay}
          disabled={!text.trim()}
          color={isSpeaking ? 'info' : 'default'}
          data-testid={`translation-play-${language}`}
        >
          <Volume2 size={18} />
        </IconButton>
        <IconButton
          aria-label={i18n._('Remove language')}
          onClick={onRemove}
          disabled={!canRemove}
          data-testid={`translation-remove-${language}`}
        >
          <X size={18} />
        </IconButton>
      </Stack>

      <TextField
        multiline
        minRows={12}
        fullWidth
        value={text}
        onChange={(event) => onChangeText(event.target.value)}
        onPaste={(event) => {
          const pastedText = event.clipboardData.getData('text/plain');
          if (!pastedText) {
            return;
          }
          event.preventDefault();
          onPasteText(pastedText);
        }}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={i18n._('Type or paste text')}
        inputProps={{
          'data-testid': `translation-textarea-${language}`,
          'data-translation-column': 'true',
        }}
      />

      {isTranslating && <LoadingShapes sizes={['18px']} />}

      <Button
        variant="outlined"
        color="info"
        onClick={onGiveExamples}
        disabled={!text.trim() || examples?.loading}
        data-testid={`translation-examples-${language}`}
        sx={{ textTransform: 'none', alignSelf: 'flex-start' }}
      >
        {i18n._('Give examples')}
      </Button>

      {examples?.loading && <LoadingShapes sizes={['16px', '16px', '16px']} />}
      {examples?.error && (
        <Typography variant="body2" color="error">
          {examples.error}
        </Typography>
      )}
      {examples?.examples && examples.examples.length > 0 && (
        <Stack component="ol" sx={{ gap: '8px', paddingLeft: '18px', margin: 0 }}>
          {examples.examples.map((example) => (
            <Typography key={example} component="li" variant="body2">
              {example}
            </Typography>
          ))}
        </Stack>
      )}
    </Stack>
  );
};
