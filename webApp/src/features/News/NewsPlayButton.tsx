'use client';

import { useLingui } from '@lingui/react';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import { Button, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import { StyledSelect } from '../uiKit/StyledSelect/StyledSelect';
import { NewsVoiceApi } from './useNewsVoice';

interface NewsPlayButtonProps {
  text: string;
  voice: NewsVoiceApi;
}

export const NewsPlayButton = ({ text, voice }: NewsPlayButtonProps) => {
  const { i18n } = useLingui();
  const voiceOptions = useMemo(
    () =>
      voice.voices.map((v) => ({
        value: v.voiceURI,
        label: v.name,
        language: v.lang,
      })),
    [voice.voices],
  );

  const selectedVoiceValue = voice.effectiveVoiceURI ?? '';

  const handleVoiceChange = (value: string) => {
    const nextURI = value || null;
    voice.setSelectedVoiceURI(nextURI);
    voice.stop();
  };

  const handlePlayPause = () => {
    if (voice.isPlaying) {
      voice.stop();
    } else {
      voice.play(text);
    }
  };

  const isNotSupported = !voice.isSupported || voice.voices.length === 0;

  return (
    <Stack
      sx={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px 18px',
        flexWrap: 'wrap',
        position: 'sticky',
        top: 0,
        width: '100%',
        backgroundColor: '#242425',
        borderRadius: '8px',
        zIndex: 1,
        padding: '10px 12px',
        marginLeft: '-2px',
        '@media (max-width: 900px)': {
          justifyContent: 'flex-start',
        },
      }}
    >
      <Button
        variant="outlined"
        onClick={handlePlayPause}
        disabled={isNotSupported}
        startIcon={
          isNotSupported ? (
            <VolumeOffIcon fontSize="small" />
          ) : voice.isPlaying ? (
            <PauseIcon fontSize="small" />
          ) : (
            <PlayArrowIcon fontSize="small" />
          )
        }
        sx={{
          color: isNotSupported ? 'rgba(255,255,255,0.3)' : '#f7f9ff',
          borderColor: 'rgba(255,255,255,0.24)',
          '&:hover': {
            borderColor: 'rgba(255,255,255,0.4)',
            backgroundColor: 'rgba(255,255,255,0.08)',
          },
          '&.Mui-disabled': {
            color: 'rgba(255,255,255,0.3)',
            borderColor: 'rgba(255,255,255,0.12)',
          },
        }}
      >
        {voice.isPlaying ? i18n._('Pause') : i18n._('Play')}
      </Button>
      <Typography variant="body2" sx={{ opacity: 0.7, flexShrink: 0 }}>
        {voice.bcp47Language}
      </Typography>

      {isNotSupported && (
        <Typography variant="caption" sx={{ opacity: 0.5 }}>
          {!voice.isSupported
            ? i18n._('Text-to-speech is not supported on your device')
            : i18n._(`No voices available for ${voice.bcp47Language} on your device`)}
        </Typography>
      )}

      {!isNotSupported && voiceOptions.length > 0 && (
        <StyledSelect
          value={selectedVoiceValue}
          onChange={handleVoiceChange}
          options={voiceOptions}
          sx={{ minWidth: '120px' }}
        />
      )}
    </Stack>
  );
};
