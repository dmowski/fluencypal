'use client';

import { useLingui } from '@lingui/react';
import { Button, Checkbox, FormControlLabel, Stack, Typography } from '@mui/material';
import { Plus, Volume2, VolumeX } from 'lucide-react';
import { useMemo, useState } from 'react';
import LanguageAutocomplete, { SelectGroupItem } from '@/features/Lang/LanguageAutocomplete';
import { fullLanguagesList } from '@/libs/language/languages';
import { NativeLangCode } from '@/libs/language/type';
import { MAX_TRANSLATION_LANGUAGES } from './constants';

export const TranslationSettingsBar = ({
  languages,
  voiceOverEnabled,
  autoPronounceSource,
  autoPronounceResult,
  speechSupported,
  onToggleVoiceOver,
  onToggleAutoPronounceSource,
  onToggleAutoPronounceResult,
  onAddLanguage,
}: {
  languages: NativeLangCode[];
  voiceOverEnabled: boolean;
  autoPronounceSource: boolean;
  autoPronounceResult: boolean;
  speechSupported: boolean;
  onToggleVoiceOver: () => void;
  onToggleAutoPronounceSource: (checked: boolean) => void;
  onToggleAutoPronounceResult: (checked: boolean) => void;
  onAddLanguage: (language: NativeLangCode) => void;
}) => {
  const { i18n } = useLingui();
  const [isAddingLanguage, setIsAddingLanguage] = useState(false);

  const addLanguageOptions = useMemo(
    (): SelectGroupItem[] =>
      fullLanguagesList
        .filter((language) => !languages.includes(language.languageCode))
        .sort((left, right) => left.englishName.localeCompare(right.englishName))
        .map((language) => ({ ...language, groupTitle: i18n._('Languages') })),
    [i18n, languages],
  );

  const canAddLanguage =
    languages.length < MAX_TRANSLATION_LANGUAGES && addLanguageOptions.length > 0;

  return (
    <Stack
      sx={{
        gap: '12px',
        width: '100%',
      }}
    >
      <Stack
        sx={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {i18n._('Translate')}
        </Typography>
        <Button
          variant={voiceOverEnabled ? 'contained' : 'outlined'}
          color={voiceOverEnabled ? 'info' : 'inherit'}
          startIcon={voiceOverEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          onClick={onToggleVoiceOver}
          disabled={!speechSupported}
          data-testid="translation-voice-over-toggle"
          sx={{ textTransform: 'none' }}
        >
          {voiceOverEnabled ? i18n._('Voice over on') : i18n._('Voice over off')}
        </Button>
      </Stack>

      <Stack
        sx={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={autoPronounceSource}
              onChange={(_event, checked) => onToggleAutoPronounceSource(checked)}
              disabled={!speechSupported || !voiceOverEnabled}
            />
          }
          label={i18n._('Pronounce source')}
          data-testid="translation-pronounce-source"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={autoPronounceResult}
              onChange={(_event, checked) => onToggleAutoPronounceResult(checked)}
              disabled={!speechSupported || !voiceOverEnabled}
            />
          }
          label={i18n._('Pronounce translations')}
          data-testid="translation-pronounce-result"
        />
        {canAddLanguage && !isAddingLanguage && (
          <Button
            variant="outlined"
            color="info"
            startIcon={<Plus size={16} />}
            onClick={() => setIsAddingLanguage(true)}
            sx={{ textTransform: 'none' }}
          >
            {i18n._('Add language')}
          </Button>
        )}
      </Stack>

      {isAddingLanguage && canAddLanguage && (
        <LanguageAutocomplete
          id="translation-add-language"
          options={addLanguageOptions}
          value={null}
          label={i18n._('Add language')}
          onChange={(language) => {
            onAddLanguage(language);
            setIsAddingLanguage(false);
          }}
        />
      )}
    </Stack>
  );
};
