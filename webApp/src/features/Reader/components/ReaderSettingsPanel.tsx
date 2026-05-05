import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  Typography,
} from '@mui/material';
import { useLingui } from '@lingui/react';
import { SelectChangeEvent } from '@mui/material/Select';
import { useMemo } from 'react';
import { fullLanguagesMap } from '@/libs/language/languages';
import { NativeLangCode } from '@/libs/language/type';
import { useBrowserSpeech } from '../hooks/useBrowserSpeech';
import { READER_SETTINGS_RANGES, useReaderSettings } from '../hooks/useReaderSettings';

type ReaderSettingsPanelProps = {
  speech: ReturnType<typeof useBrowserSpeech>;
  isTouchDevice: boolean;
  localFontSize: number;
  localParagraphGap: number;
  localLineHeight: number;
  setLocalFontSize: (value: number) => void;
  setLocalParagraphGap: (value: number) => void;
  setLocalLineHeight: (value: number) => void;
};

const PREVIEW_TEXT = 'This is a preview of the selected voice.';

export const ReaderSettingsPanel = ({
  speech,
  isTouchDevice,
  localFontSize,
  localParagraphGap,
  localLineHeight,
  setLocalFontSize,
  setLocalParagraphGap,
  setLocalLineHeight,
}: ReaderSettingsPanelProps) => {
  const { i18n } = useLingui();
  const readerSettings = useReaderSettings();

  const availableLanguages = useMemo(() => {
    const uniqueLanguages = new Set<string>();

    speech.voices.forEach((voice) => {
      if (voice.lang) {
        uniqueLanguages.add(voice.lang);
      }
    });

    if (speech.language) {
      uniqueLanguages.add(speech.language);
    }

    return Array.from(uniqueLanguages).sort();
  }, [speech.language, speech.voices]);

  const voicesForLanguage = useMemo(() => {
    return speech.voices.filter((voice) => {
      const voiceLanguage = voice.lang.toLowerCase();
      const selectedLanguage = speech.language.toLowerCase();

      return voiceLanguage === selectedLanguage || voiceLanguage.startsWith(`${selectedLanguage}-`);
    });
  }, [speech.language, speech.voices]);

  const selectedVoiceValue = useMemo(() => {
    const isSelectedVoiceVisible = voicesForLanguage.some(
      (voice) => voice.voiceURI === speech.selectedVoiceURI,
    );

    return isSelectedVoiceVisible ? speech.selectedVoiceURI || '' : '';
  }, [speech.selectedVoiceURI, voicesForLanguage]);

  const handleVoiceChange = (event: SelectChangeEvent<string>) => {
    const nextVoiceURI = event.target.value;
    speech.setSelectedVoiceURI(nextVoiceURI || null);
    speech.play(PREVIEW_TEXT, nextVoiceURI || null);
  };

  const translationLanguages = useMemo(
    () =>
      Object.values(fullLanguagesMap).sort((left, right) =>
        left.englishName.localeCompare(right.englishName),
      ),
    [],
  );

  const handleTranslateToChange = (event: SelectChangeEvent<string>) => {
    const nextLanguage = event.target.value;
    readerSettings.setTranslateToLanguage((nextLanguage || null) as NativeLangCode | null);
  };

  return (
    <Stack sx={{ gap: '20px' }}>
      <Typography variant="body2">
        {i18n._('Speech support')}:{' '}
        {speech.isSupported ? i18n._('Supported') : i18n._('Not supported')}
      </Typography>

      <FormControl
        size="small"
        fullWidth
        disabled={!speech.isSupported || availableLanguages.length === 0}
      >
        <InputLabel id="speech-language-select-label">{i18n._('Language')}</InputLabel>
        <Select
          labelId="speech-language-select-label"
          label={i18n._('Language')}
          value={speech.language}
          onChange={(event) => speech.setLanguage(event.target.value)}
        >
          {availableLanguages.map((language) => (
            <MenuItem key={language} value={language}>
              {language}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl
        size="small"
        fullWidth
        disabled={!speech.isSupported || voicesForLanguage.length === 0}
      >
        <InputLabel id="speech-voice-select-label">{i18n._('Voice')}</InputLabel>
        <Select
          labelId="speech-voice-select-label"
          label={i18n._('Voice')}
          value={selectedVoiceValue}
          onChange={handleVoiceChange}
        >
          {voicesForLanguage.map((voice) => (
            <MenuItem key={voice.voiceURI} value={voice.voiceURI}>
              {voice.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" fullWidth>
        <InputLabel id="reader-translate-to-select-label">{i18n._('Translate to')}</InputLabel>
        <Select
          labelId="reader-translate-to-select-label"
          label={i18n._('Translate to')}
          value={readerSettings.translateToLanguage || ''}
          onChange={handleTranslateToChange}
        >
          <MenuItem value="">{i18n._('Off')}</MenuItem>
          {translationLanguages.map((language) => (
            <MenuItem key={language.languageCode} value={language.languageCode}>
              {language.englishName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControlLabel
        control={
          <Checkbox
            checked={readerSettings.justifyText}
            onChange={(_event, checked) => readerSettings.setJustifyText(checked)}
          />
        }
        label={i18n._('Justify Text')}
      />

      {!isTouchDevice && (
        <FormControlLabel
          control={
            <Checkbox
              checked={readerSettings.translateOnHover}
              onChange={(_event, checked) => readerSettings.setTranslateOnHover(checked)}
            />
          }
          label={i18n._('Translate on Hover')}
        />
      )}

      <FormControlLabel
        control={
          <Checkbox
            checked={readerSettings.voiceOverSelectedText}
            onChange={(_event, checked) => readerSettings.setVoiceOverSelectedText(checked)}
          />
        }
        label={i18n._('Voice Over Selected Text')}
      />

      <Stack sx={{ gap: '8px' }}>
        <Stack sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Typography variant="body2">{i18n._('Font size')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {localFontSize}px
          </Typography>
        </Stack>
        <Slider
          min={READER_SETTINGS_RANGES.fontSize.min}
          max={READER_SETTINGS_RANGES.fontSize.max}
          step={READER_SETTINGS_RANGES.fontSize.step}
          value={localFontSize}
          onChange={(_event, value) => setLocalFontSize(Array.isArray(value) ? value[0] : value)}
          valueLabelDisplay="auto"
        />
      </Stack>

      <Stack sx={{ gap: '8px' }}>
        <Stack sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Typography variant="body2">{i18n._('Paragraph gap')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {localParagraphGap}px
          </Typography>
        </Stack>
        <Slider
          min={READER_SETTINGS_RANGES.paragraphGap.min}
          max={READER_SETTINGS_RANGES.paragraphGap.max}
          step={READER_SETTINGS_RANGES.paragraphGap.step}
          value={localParagraphGap}
          onChange={(_event, value) =>
            setLocalParagraphGap(Array.isArray(value) ? value[0] : value)
          }
          valueLabelDisplay="auto"
        />
      </Stack>

      <Stack sx={{ gap: '8px' }}>
        <Stack sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Typography variant="body2">{i18n._('Line height')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {localLineHeight.toFixed(2)}
          </Typography>
        </Stack>
        <Slider
          min={READER_SETTINGS_RANGES.lineHeight.min}
          max={READER_SETTINGS_RANGES.lineHeight.max}
          step={READER_SETTINGS_RANGES.lineHeight.step}
          value={localLineHeight}
          onChange={(_event, value) => setLocalLineHeight(Array.isArray(value) ? value[0] : value)}
          valueLabelDisplay="auto"
        />
      </Stack>

      <Button
        variant="outlined"
        color="inherit"
        onClick={readerSettings.resetToDefault}
        sx={{ alignSelf: 'flex-start' }}
      >
        {i18n._('Reset to default')}
      </Button>
    </Stack>
  );
};
