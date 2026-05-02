import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Popover,
  Select,
  Slider,
  Stack,
  Typography,
} from '@mui/material';
import { Settings } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLingui } from '@lingui/react';
import { SelectChangeEvent } from '@mui/material/Select';
import { fullLanguagesMap } from '@/libs/language/languages';
import { NativeLangCode } from '@/libs/language/type';
import { useBrowserSpeech } from '../hooks/useBrowserSpeech';
import { READER_SETTINGS_RANGES, useReaderSettings } from '../hooks/useReaderSettings';

type ReaderSpeechSettingsButtonProps = {
  speech: ReturnType<typeof useBrowserSpeech>;
};

const PREVIEW_TEXT = 'This is a preview of the selected voice.';
const SETTINGS_UPDATE_DELAY_MS = 350;

export const ReaderSpeechSettingsButton = ({ speech }: ReaderSpeechSettingsButtonProps) => {
  const { i18n } = useLingui();
  const readerSettings = useReaderSettings();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [localFontSize, setLocalFontSize] = useState(readerSettings.fontSize);
  const [localParagraphGap, setLocalParagraphGap] = useState(readerSettings.paragraphGap);
  const [localLineHeight, setLocalLineHeight] = useState(readerSettings.lineHeight);

  const open = Boolean(anchorEl);

  useEffect(() => {
    if (!open) return;

    setLocalFontSize(readerSettings.fontSize);
    setLocalParagraphGap(readerSettings.paragraphGap);
    setLocalLineHeight(readerSettings.lineHeight);
  }, [open, readerSettings.fontSize, readerSettings.lineHeight, readerSettings.paragraphGap]);

  useEffect(() => {
    if (!open) return;
    if (localFontSize === readerSettings.fontSize) return;
    const timeoutId = setTimeout(() => {
      readerSettings.setFontSize(localFontSize);
    }, SETTINGS_UPDATE_DELAY_MS);

    return () => clearTimeout(timeoutId);
  }, [localFontSize, open, readerSettings.fontSize, readerSettings.setFontSize]);

  useEffect(() => {
    if (!open) return;
    if (localParagraphGap === readerSettings.paragraphGap) return;
    const timeoutId = setTimeout(() => {
      readerSettings.setParagraphGap(localParagraphGap);
    }, SETTINGS_UPDATE_DELAY_MS);

    return () => clearTimeout(timeoutId);
  }, [localParagraphGap, open, readerSettings.paragraphGap, readerSettings.setParagraphGap]);

  useEffect(() => {
    if (!open) return;
    if (localLineHeight === readerSettings.lineHeight) return;
    const timeoutId = setTimeout(() => {
      readerSettings.setLineHeight(localLineHeight);
    }, SETTINGS_UPDATE_DELAY_MS);

    return () => clearTimeout(timeoutId);
  }, [localLineHeight, open, readerSettings.lineHeight, readerSettings.setLineHeight]);

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
    <>
      <IconButton
        onClick={(event) => setAnchorEl(event.currentTarget)}
        sx={{
          position: 'fixed',
          top: '5px',
          left: '5px',
          zIndex: 3,
          height: '54px',
          width: '54px',
          backgroundColor: 'transparent',
          color: '#333',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        <Settings size={18} />
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Stack sx={{ padding: '20px 20px 30px 20px', width: 340, gap: '30px' }}>
          <Stack>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {i18n._('Settings')}
            </Typography>

            <Typography variant="body2">
              {i18n._('Speech support')}:{' '}
              {speech.isSupported ? i18n._('Supported') : i18n._('Not supported')}
            </Typography>
          </Stack>

          <Stack
            sx={{
              gap: '20px',
            }}
          >
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
              <InputLabel id="reader-translate-to-select-label">
                {i18n._('Translate to')}
              </InputLabel>
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

            <FormControlLabel
              control={
                <Checkbox
                  checked={readerSettings.translateOnHover}
                  onChange={(_event, checked) => readerSettings.setTranslateOnHover(checked)}
                />
              }
              label={i18n._('Translate on Hover')}
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
                onChange={(_event, value) =>
                  setLocalFontSize(Array.isArray(value) ? value[0] : value)
                }
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
                onChange={(_event, value) =>
                  setLocalLineHeight(Array.isArray(value) ? value[0] : value)
                }
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
        </Stack>
      </Popover>
    </>
  );
};
