import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
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
 * localStorage writes and context updates. Layout steppers (font size, gap,
 * line height) use a longer debounce — see LAYOUT_SETTING_APPLY_DELAY_MS.
 *
 * DO NOT remove or reduce this without profiling the render cost first.
 * NOTE: e2e tests that close the settings popover immediately after toggling
 * a checkbox must wait ≥ SETTINGS_UPDATE_DELAY_MS before closing — see
 * enableVoiceOverSelectedText in e2e/libs/books/uiSettings.ts.
 */
const SETTINGS_UPDATE_DELAY_MS = 350;
/**
 * Layout steppers recompute pagination on every persisted change. Debounce
 * applies so rapid +/- clicks stay responsive; pending values flush on unmount.
 */
const LAYOUT_SETTING_APPLY_DELAY_MS = 3000;

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

type LayoutSettingRange = {
  min: number;
  max: number;
  step: number;
};

const clampLayoutSettingValue = (
  value: number,
  { min, max, step }: LayoutSettingRange,
): number => {
  const stepped = Math.round((value - min) / step) * step + min;
  return Math.max(min, Math.min(max, Number(stepped.toFixed(10))));
};

/**
 * Layout steppers (font size, paragraph gap, line height) recompute pagination
 * on every persisted change. Update local state immediately for responsive UI,
 * debounce persistence, and flush any pending value when the panel closes.
 */
function useLayoutSetting(
  persistedValue: number,
  applyFn: (value: number) => void,
): {
  value: number;
  setValue: (nextValue: number) => void;
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
    const id = setTimeout(() => applyFn(localValue), LAYOUT_SETTING_APPLY_DELAY_MS);
    return () => clearTimeout(id);
  }, [localValue, persistedValue, applyFn]);

  useEffect(() => {
    return () => {
      if (localValueRef.current !== persistedValueRef.current) {
        applyFn(localValueRef.current);
      }
    };
  }, [applyFn]);

  const setValue = useCallback((nextValue: number) => {
    setLocalValue(nextValue);
  }, []);

  return {
    value: localValue,
    setValue,
  };
}

type LayoutSettingStepperProps = {
  label: string;
  value: number;
  range: LayoutSettingRange;
  formatValue: (value: number) => string;
  decreaseAriaLabel: string;
  increaseAriaLabel: string;
  onChange: (nextValue: number) => void;
};

const LayoutSettingStepper = ({
  label,
  value,
  range,
  formatValue,
  decreaseAriaLabel,
  increaseAriaLabel,
  onChange,
}: LayoutSettingStepperProps) => {
  const canDecrease = value > range.min;
  const canIncrease = value < range.max;

  const handleDecrease = () => {
    if (!canDecrease) return;
    onChange(clampLayoutSettingValue(value - range.step, range));
  };

  const handleIncrease = () => {
    if (!canIncrease) return;
    onChange(clampLayoutSettingValue(value + range.step, range));
  };

  return (
    <Stack sx={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Typography variant="body2">{label}</Typography>
      <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: '4px' }}>
        <IconButton
          size="small"
          onClick={handleDecrease}
          disabled={!canDecrease}
          aria-label={decreaseAriaLabel}
        >
          <RemoveIcon fontSize="small" />
        </IconButton>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ minWidth: '56px', textAlign: 'center' }}
        >
          {formatValue(value)}
        </Typography>
        <IconButton
          size="small"
          onClick={handleIncrease}
          disabled={!canIncrease}
          aria-label={increaseAriaLabel}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Stack>
  );
};

export const ReaderSettingsPanel = ({
  speech,
  isTouchDevice,
  onReset,
}: ReaderSettingsPanelProps) => {
  const { i18n } = useLingui();
  const readerSettings = useReaderSettings();

  const fontSizeSetting = useLayoutSetting(readerSettings.fontSize, readerSettings.setFontSize);
  const paragraphGapSetting = useLayoutSetting(
    readerSettings.paragraphGap,
    readerSettings.setParagraphGap,
  );
  const lineHeightSetting = useLayoutSetting(
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

      <LayoutSettingStepper
        label={i18n._('Font size')}
        value={fontSizeSetting.value}
        range={READER_SETTINGS_RANGES.fontSize}
        formatValue={(value) => `${value}px`}
        decreaseAriaLabel={i18n._('Decrease font size')}
        increaseAriaLabel={i18n._('Increase font size')}
        onChange={fontSizeSetting.setValue}
      />

      <LayoutSettingStepper
        label={i18n._('Paragraph gap')}
        value={paragraphGapSetting.value}
        range={READER_SETTINGS_RANGES.paragraphGap}
        formatValue={(value) => `${value}px`}
        decreaseAriaLabel={i18n._('Decrease paragraph gap')}
        increaseAriaLabel={i18n._('Increase paragraph gap')}
        onChange={paragraphGapSetting.setValue}
      />

      <LayoutSettingStepper
        label={i18n._('Line height')}
        value={lineHeightSetting.value}
        range={READER_SETTINGS_RANGES.lineHeight}
        formatValue={(value) => value.toFixed(2)}
        decreaseAriaLabel={i18n._('Decrease line height')}
        increaseAriaLabel={i18n._('Increase line height')}
        onChange={lineHeightSetting.setValue}
      />

      <Button variant="outlined" color="inherit" onClick={onReset} sx={{ alignSelf: 'flex-start' }}>
        {i18n._('Reset to default')}
      </Button>
    </Stack>
  );
};
