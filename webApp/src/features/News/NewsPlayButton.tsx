'use client';

import { useLingui } from '@lingui/react';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import ReplayIcon from '@mui/icons-material/Replay';
import { Button, ButtonProps, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import { StyledSelect } from '../uiKit/StyledSelect/StyledSelect';
import { NewsVoiceApi } from './useNewsVoice';

interface NewsPlayButtonProps {
  text: string;
  voice: NewsVoiceApi;
}

const PlayerButton = ({
  children,
  disabled,
  ...props
}: Pick<ButtonProps, 'children' | 'onClick' | 'startIcon' | 'disabled'>) => (
  <Button
    variant="outlined"
    disabled={disabled}
    sx={{
      color: disabled ? 'rgba(255,255,255,0.3)' : '#f7f9ff',
      borderColor: disabled ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.24)',
      '&:hover': {
        borderColor: 'rgba(255,255,255,0.4)',
        backgroundColor: 'rgba(255,255,255,0.08)',
      },
      '&.Mui-disabled': {
        color: 'rgba(255,255,255,0.3)',
        borderColor: 'rgba(255,255,255,0.12)',
      },
    }}
    {...props}
  >
    {children}
  </Button>
);

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
      voice.pause();
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
      {voice.isPaused ? (
        <Stack
          sx={{ flexDirection: 'row', alignItems: 'center', gap: '8px 18px', flexWrap: 'wrap' }}
        >
          <PlayerButton
            onClick={() => voice.resume()}
            startIcon={<PlayArrowIcon fontSize="small" />}
          >
            {i18n._('Continue')}
          </PlayerButton>
          <PlayerButton
            onClick={() => {
              voice.stop();
              voice.play(text);
            }}
            startIcon={<ReplayIcon fontSize="small" />}
          >
            {i18n._('Restart')}
          </PlayerButton>
        </Stack>
      ) : (
        <PlayerButton
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
        >
          {voice.isPlaying ? i18n._('Pause') : i18n._('Play')}
        </PlayerButton>
      )}

      {isNotSupported && (
        <Typography variant="caption" sx={{ opacity: 0.5 }}>
          {!voice.isSupported
            ? i18n._('Text-to-speech is not supported on your device')
            : i18n._('No voices available on your device')}
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
