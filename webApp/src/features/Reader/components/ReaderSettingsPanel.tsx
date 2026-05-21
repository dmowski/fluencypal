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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fullLanguagesMap } from '@/libs/language/languages';
import { NativeLangCode } from '@/libs/language/type';
import { useBrowserSpeech } from '../hooks/useBrowserSpeech';
import { READER_SETTINGS_RANGES, useReaderSettings } from '../hooks/useReaderSettings';

type ReaderSettingsPanelProps = {
  speech: ReturnType<typeof useBrowserSpeech>;
  isTouchDevice: boolean;
  onReset: () => void;
};

const PREVIEW_TEXT = 'This is a preview of the selected voice.';
/**
 * The intentional debounce delay for non-layout settings writes.
 *
 * Checkboxes and selects use this delay so a single interaction does not spam
 * localStorage writes and context updates. Layout sliders (font size, gap,
 * line height) apply on thumb release instead — see useLayoutSliderSetting.
 *
 * DO NOT remove or reduce this without profiling the render cost first.
 * NOTE: e2e tests that close the settings popover immediately after toggling
 * a checkbox must wait ≥ SETTINGS_UPDATE_DELAY_MS before closing — see
 * enableVoiceOverSelectedText in e2e/libs/books/uiSettings.ts.
 */
const SETTINGS_UPDATE_DELAY_MS = 350;
const LAYOUT_SLIDER_FALLBACK_DELAY_MS = 600;

/**
 * Writes `localValue` to persistent storage after SETTINGS_UPDATE_DELAY_MS
 * whenever it diverges from `persistedValue`. The timer is cancelled on
 * unmount, so callers must not close the panel before it fires.
 */
function useDebouncedSetting<T>(
  localValue: T,
  persistedValue: T,
  applyFn: (value: T) => void,
): void {
  useEffect(() => {
    if (localValue === persistedValue) return;
    const id = setTimeout(() => applyFn(localValue), SETTINGS_UPDATE_DELAY_MS);
    return () => clearTimeout(id);
  }, [localValue, persistedValue, applyFn]);
}

/**
 * Layout sliders (font size, paragraph gap, line height) recompute pagination
 * on every persisted change. Keep the thumb responsive with local state during
 * drag, apply on release, and flush any pending value when the panel closes.
 */
function useLayoutSliderSetting(
  persistedValue: number,
  applyFn: (value: number) => void,
): {
  value: number;
  setValue: (nextValue: number) => void;
  commitValue: (nextValue: number) => void;
} {
  const [localValue, setLocalValue] = useState(persistedValue);
  const localValueRef = useRef(localValue);
  const persistedValueRef = useRef(persistedValue);

  localValueRef.current = localValue;
  persistedValueRef.current = persistedValue;

  useEffect(() => {
    setLocalValue(persistedValue);
  }, [persistedValue]);

  useEffect(() => {
    if (localValue === persistedValue) return;
    const id = setTimeout(() => applyFn(localValue), LAYOUT_SLIDER_FALLBACK_DELAY_MS);
    return () => clearTimeout(id);
  }, [localValue, persistedValue, applyFn]);

  useEffect(() => {
    return () => {
      if (localValueRef.current !== persistedValueRef.current) {
        applyFn(localValueRef.current);
      }
    };
  }, [applyFn]);

  const commitValue = useCallback(
    (nextValue: number) => {
      setLocalValue(nextValue);
      applyFn(nextValue);
    },
    [applyFn],
  );

  return {
    value: localValue,
    setValue: setLocalValue,
    commitValue,
  };
}

export const ReaderSettingsPanel = ({
  speech,
  isTouchDevice,
  onReset,
}: ReaderSettingsPanelProps) => {
  const { i18n } = useLingui();
  const readerSettings = useReaderSettings();

  const fontSizeSetting = useLayoutSliderSetting(readerSettings.fontSize, readerSettings.setFontSize);
  const paragraphGapSetting = useLayoutSliderSetting(
    readerSettings.paragraphGap,
    readerSettings.setParagraphGap,
  );
  const lineHeightSetting = useLayoutSliderSetting(
    readerSettings.lineHeight,
    readerSettings.setLineHeight,
  );
  const [localJustifyText, setLocalJustifyText] = useState(readerSettings.justifyText);
  const [localTranslateOnHover, setLocalTranslateOnHover] = useState(
    readerSettings.translateOnHover,
  );
  const [localVoiceOverSelectedText, setLocalVoiceOverSelectedText] = useState(
    readerSettings.voiceOverSelectedText,
  );
  const [localTranslateToLanguage, setLocalTranslateToLanguage] = useState(
    readerSettings.translateToLanguage,
  );
  const [localLanguage, setLocalLanguage] = useState(speech.language);
  const [localSelectedVoiceURI, setLocalSelectedVoiceURI] = useState(speech.selectedVoiceURI);

  useDebouncedSetting(localJustifyText, readerSettings.justifyText, readerSettings.setJustifyText);
  useDebouncedSetting(
    localTranslateOnHover,
    readerSettings.translateOnHover,
    readerSettings.setTranslateOnHover,
  );
  useDebouncedSetting(
    localVoiceOverSelectedText,
    readerSettings.voiceOverSelectedText,
    readerSettings.setVoiceOverSelectedText,
  );
  useDebouncedSetting(
    localTranslateToLanguage,
    readerSettings.translateToLanguage,
    readerSettings.setTranslateToLanguage,
  );
  useDebouncedSetting(localLanguage, speech.language, speech.setLanguage);
  useDebouncedSetting(localSelectedVoiceURI, speech.selectedVoiceURI, speech.setSelectedVoiceURI);

  const availableLanguages = useMemo(() => {
    const uniqueLanguages = new Set<string>();

    speech.voices.forEach((voice) => {
      if (voice.lang) {
        uniqueLanguages.add(voice.lang);
      }
    });

    // Always include the local language so it stays in the list before debounce persists it.
    if (localLanguage) {
      uniqueLanguages.add(localLanguage);
    }

    return Array.from(uniqueLanguages).sort();
  }, [localLanguage, speech.voices]);

  const voicesForLanguage = useMemo(() => {
    return speech.voices.filter((voice) => {
      const voiceLanguage = voice.lang.toLowerCase();
      const selectedLanguage = localLanguage.toLowerCase();

      return voiceLanguage === selectedLanguage || voiceLanguage.startsWith(`${selectedLanguage}-`);
    });
  }, [localLanguage, speech.voices]);

  const selectedVoiceValue = useMemo(() => {
    const isSelectedVoiceVisible = voicesForLanguage.some(
      (voice) => voice.voiceURI === localSelectedVoiceURI,
    );

    return isSelectedVoiceVisible ? localSelectedVoiceURI || '' : '';
  }, [localSelectedVoiceURI, voicesForLanguage]);

  const handleVoiceChange = (event: SelectChangeEvent<string>) => {
    const nextVoiceURI = event.target.value || null;
    setLocalSelectedVoiceURI(nextVoiceURI);
    // Play preview immediately for instant auditory feedback; the URI is
    // persisted after the debounce via useDebouncedSetting above.
    speech.play(PREVIEW_TEXT, nextVoiceURI);
  };

  const translationLanguages = useMemo(
    () =>
      Object.values(fullLanguagesMap).sort((left, right) =>
        left.englishName.localeCompare(right.englishName),
      ),
    [],
  );

  const handleTranslateToChange = (event: SelectChangeEvent<string>) => {
    setLocalTranslateToLanguage((event.target.value || null) as NativeLangCode | null);
  };

  return (
    <Stack sx={{ gap: '20px', width: '100%' }}>
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
          value={localLanguage}
          onChange={(event) => setLocalLanguage(event.target.value)}
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
          value={localTranslateToLanguage || ''}
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
      <Stack>
        <FormControlLabel
          control={
            <Checkbox
              checked={localJustifyText}
              onChange={(_event, checked) => setLocalJustifyText(checked)}
            />
          }
          label={i18n._('Justify Text')}
        />

        {!isTouchDevice && (
          <FormControlLabel
            control={
              <Checkbox
                checked={localTranslateOnHover}
                onChange={(_event, checked) => setLocalTranslateOnHover(checked)}
              />
            }
            label={i18n._('Translate on Hover')}
          />
        )}

        <FormControlLabel
          control={
            <Checkbox
              checked={localVoiceOverSelectedText}
              onChange={(_event, checked) => setLocalVoiceOverSelectedText(checked)}
            />
          }
          label={i18n._('Voice Over Selected Text')}
        />
      </Stack>

      <Stack sx={{ gap: '8px' }}>
        <Stack sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Typography variant="body2">{i18n._('Font size')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {fontSizeSetting.value}px
          </Typography>
        </Stack>
        <Slider
          min={READER_SETTINGS_RANGES.fontSize.min}
          max={READER_SETTINGS_RANGES.fontSize.max}
          step={READER_SETTINGS_RANGES.fontSize.step}
          value={fontSizeSetting.value}
          onChange={(_event, value) =>
            fontSizeSetting.setValue(Array.isArray(value) ? value[0] : value)
          }
          onChangeCommitted={(_event, value) =>
            fontSizeSetting.commitValue(Array.isArray(value) ? value[0] : value)
          }
          valueLabelDisplay="auto"
        />
      </Stack>

      <Stack sx={{ gap: '8px' }}>
        <Stack sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Typography variant="body2">{i18n._('Paragraph gap')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {paragraphGapSetting.value}px
          </Typography>
        </Stack>
        <Slider
          min={READER_SETTINGS_RANGES.paragraphGap.min}
          max={READER_SETTINGS_RANGES.paragraphGap.max}
          step={READER_SETTINGS_RANGES.paragraphGap.step}
          value={paragraphGapSetting.value}
          onChange={(_event, value) =>
            paragraphGapSetting.setValue(Array.isArray(value) ? value[0] : value)
          }
          onChangeCommitted={(_event, value) =>
            paragraphGapSetting.commitValue(Array.isArray(value) ? value[0] : value)
          }
          valueLabelDisplay="auto"
        />
      </Stack>

      <Stack sx={{ gap: '8px' }}>
        <Stack sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Typography variant="body2">{i18n._('Line height')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {lineHeightSetting.value.toFixed(2)}
          </Typography>
        </Stack>
        <Slider
          min={READER_SETTINGS_RANGES.lineHeight.min}
          max={READER_SETTINGS_RANGES.lineHeight.max}
          step={READER_SETTINGS_RANGES.lineHeight.step}
          value={lineHeightSetting.value}
          onChange={(_event, value) =>
            lineHeightSetting.setValue(Array.isArray(value) ? value[0] : value)
          }
          onChangeCommitted={(_event, value) =>
            lineHeightSetting.commitValue(Array.isArray(value) ? value[0] : value)
          }
          valueLabelDisplay="auto"
        />
      </Stack>

      <Button variant="outlined" color="inherit" onClick={onReset} sx={{ alignSelf: 'flex-start' }}>
        {i18n._('Reset to default')}
      </Button>
    </Stack>
  );
};
