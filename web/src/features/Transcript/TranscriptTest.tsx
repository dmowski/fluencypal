'use client';

import { useState } from 'react';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { useRealtimeTranscript } from './useRealtimeTranscript';
import { SupportedLanguage, fullEnglishLanguageName, supportedLanguages } from '../Lang/lang';
import { useSettings } from '../Settings/useSettings';

export const TranscriptTest = () => {
  const {
    start,
    stop,
    clear,
    isActive,
    isActivating,
    partialTranscript,
    completedTranscripts,
    activeMode,
  } = useRealtimeTranscript();
  const settings = useSettings();
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'ai' | 'native'>('ai');
  const [language, setLanguage] = useState<SupportedLanguage>(settings.languageCode || 'en');

  const handleStart = async () => {
    setError(null);
    try {
      await start({ mode, language });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start transcription');
    }
  };

  const handleStop = () => {
    stop();
  };

  const handleClear = () => {
    clear();
    setError(null);
  };

  const hasContent = completedTranscripts.length > 0 || partialTranscript;

  return (
    <Stack sx={{ p: 3, gap: 2, maxWidth: 700 }}>
      <Typography variant="h6">Realtime Transcript</Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 1 }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="transcript-mode-label">Mode</InputLabel>
          <Select
            labelId="transcript-mode-label"
            label="Mode"
            value={mode}
            onChange={(event) => setMode(event.target.value as 'ai' | 'native')}
          >
            <MenuItem value="ai">AI</MenuItem>
            <MenuItem value="native">Native Browser</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="transcript-language-label">Language</InputLabel>
          <Select
            labelId="transcript-language-label"
            label="Language"
            value={language}
            onChange={(event) => setLanguage(event.target.value as SupportedLanguage)}
          >
            {supportedLanguages.map((item) => (
              <MenuItem key={item} value={item}>
                {fullEnglishLanguageName[item]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <Typography variant="body2" color="text.secondary">
        Native mode falls back to AI when browser speech recognition is unavailable for the selected
        language.
      </Typography>

      <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
        {isActive ? (
          <Button variant="contained" color="error" onClick={handleStop}>
            Stop Recording
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={handleStart}
            disabled={isActivating}
            startIcon={isActivating ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {isActivating ? 'Connecting...' : 'Start Recording'}
          </Button>
        )}

        {hasContent && !isActive && (
          <Button variant="outlined" size="small" onClick={handleClear}>
            Clear
          </Button>
        )}

        {isActive && (
          <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center' }}>
            <Stack
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: 'error.main',
                animation: 'pulse 1.2s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.3 },
                },
              }}
            />
            <Typography variant="caption" color="error">
              Recording via {activeMode === 'native' ? 'native browser' : 'AI realtime'}
            </Typography>
          </Stack>
        )}
      </Stack>

      {error && (
        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}

      {(hasContent || isActive) && (
        <Stack
          sx={{
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 2,
            p: 2,
            gap: 1,
            minHeight: 120,
            backgroundColor: 'rgba(255,255,255,0.03)',
          }}
        >
          {completedTranscripts.length === 0 && !partialTranscript && (
            <Typography variant="body2" color="text.secondary">
              Speak into your mic to see the transcript here…
            </Typography>
          )}

          {completedTranscripts.map((text, i) => (
            <Typography key={i} variant="body1" sx={{ opacity: 0.85 }}>
              {text}
            </Typography>
          ))}

          {partialTranscript && (
            <Typography
              variant="body1"
              sx={{ color: 'primary.light', fontStyle: 'italic', opacity: 0.7 }}
            >
              {partialTranscript}
            </Typography>
          )}
        </Stack>
      )}
    </Stack>
  );
};
