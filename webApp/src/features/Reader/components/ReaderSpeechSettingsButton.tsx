import {
  FormControl,
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
import { useMemo, useState } from 'react';
import { useLingui } from '@lingui/react';
import { SelectChangeEvent } from '@mui/material/Select';
import { fullLanguagesMap } from '@/libs/language/languages';
import { NativeLangCode } from '@/libs/language/type';
import { useBrowserSpeech } from '../hooks/useBrowserSpeech';
import { useReaderSettings } from '../hooks/useReaderSettings';

type ReaderSpeechSettingsButtonProps = {
  speech: ReturnType<typeof useBrowserSpeech>;
};

const PREVIEW_TEXT = 'This is a preview of the selected voice.';

export const ReaderSpeechSettingsButton = ({ speech }: ReaderSpeechSettingsButtonProps) => {
  const { i18n } = useLingui();
  const readerSettings = useReaderSettings();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const open = Boolean(anchorEl);

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
          position: 'absolute',
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

            <Stack sx={{ gap: '8px' }}>
              <Stack sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Typography variant="body2">{i18n._('Font size')}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {readerSettings.fontSize}px
                </Typography>
              </Stack>
              <Slider
                min={20}
                max={64}
                step={1}
                value={readerSettings.fontSize}
                onChange={(_event, value) =>
                  readerSettings.setFontSize(Array.isArray(value) ? value[0] : value)
                }
                valueLabelDisplay="auto"
              />
            </Stack>

            <Stack sx={{ gap: '8px' }}>
              <Stack sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Typography variant="body2">{i18n._('Paragraph gap')}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {readerSettings.paragraphGap}px
                </Typography>
              </Stack>
              <Slider
                min={0}
                max={80}
                step={1}
                value={readerSettings.paragraphGap}
                onChange={(_event, value) =>
                  readerSettings.setParagraphGap(Array.isArray(value) ? value[0] : value)
                }
                valueLabelDisplay="auto"
              />
            </Stack>

            <Stack sx={{ gap: '8px' }}>
              <Stack sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Typography variant="body2">{i18n._('Line height')}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {readerSettings.lineHeight.toFixed(2)}
                </Typography>
              </Stack>
              <Slider
                min={1}
                max={2.5}
                step={0.05}
                value={readerSettings.lineHeight}
                onChange={(_event, value) =>
                  readerSettings.setLineHeight(Array.isArray(value) ? value[0] : value)
                }
                valueLabelDisplay="auto"
              />
            </Stack>

            <Stack sx={{ gap: '8px' }}>
              <Stack sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Typography variant="body2">{i18n._('Content width')}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {readerSettings.contentWidth}px
                </Typography>
              </Stack>
              <Slider
                min={600}
                max={1600}
                step={10}
                value={readerSettings.contentWidth}
                onChange={(_event, value) =>
                  readerSettings.setContentWidth(Array.isArray(value) ? value[0] : value)
                }
                valueLabelDisplay="auto"
              />
            </Stack>

            <Stack sx={{ gap: '8px' }}>
              <Stack sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Typography variant="body2">{i18n._('Content height')}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {readerSettings.contentHeight}px
                </Typography>
              </Stack>
              <Slider
                min={300}
                max={1200}
                step={10}
                value={readerSettings.contentHeight}
                onChange={(_event, value) =>
                  readerSettings.setContentHeight(Array.isArray(value) ? value[0] : value)
                }
                valueLabelDisplay="auto"
              />
            </Stack>
          </Stack>
        </Stack>
      </Popover>
    </>
  );
};
