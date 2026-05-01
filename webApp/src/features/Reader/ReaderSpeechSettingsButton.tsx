import {
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Popover,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { Settings } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLingui } from '@lingui/react';
import { useBrowserSpeech } from './useBrowserSpeech';

type ReaderSpeechSettingsButtonProps = {
  speech: ReturnType<typeof useBrowserSpeech>;
};

const PREVIEW_TEXT = 'This is a preview of the selected voice.';

export const ReaderSpeechSettingsButton = ({ speech }: ReaderSpeechSettingsButtonProps) => {
  const { i18n } = useLingui();
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

  return (
    <>
      <IconButton
        onClick={(event) => setAnchorEl(event.currentTarget)}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 3,
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
        <Stack sx={{ p: 2, width: 340, gap: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {i18n._('Speech settings')}
          </Typography>

          <Typography variant="body2">
            {i18n._('Browser speech support')}:{' '}
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
              onChange={(event) => speech.setSelectedVoiceURI(event.target.value)}
            >
              {voicesForLanguage.map((voice) => (
                <MenuItem key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              disabled={!speech.isSupported}
              onClick={() => speech.play(PREVIEW_TEXT)}
              sx={{ textTransform: 'none' }}
            >
              {i18n._('Preview voice')}
            </Button>
            <Button
              variant="outlined"
              disabled={!speech.isSupported || !speech.isPlaying}
              onClick={speech.stop}
              sx={{ textTransform: 'none' }}
            >
              {i18n._('Stop')}
            </Button>
          </Stack>
        </Stack>
      </Popover>
    </>
  );
};
