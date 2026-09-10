'use client';

import { useEffect, useState } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { Check } from 'lucide-react';
import { CustomModal } from '../uiKit/Modal/CustomModal';
import {
  loadAudioInputDevices,
  readPreferredMicrophoneId,
  writePreferredMicrophoneId,
  type AudioInputDevice,
} from '@/libs/mic';

interface MicrophoneSettingsModalProps {
  onClose: () => void;
}

export const MicrophoneSettingsModal = ({ onClose }: MicrophoneSettingsModalProps) => {
  const { i18n } = useLingui();
  const [selectedMicrophoneId, setSelectedMicrophoneId] = useState<string | null>(
    readPreferredMicrophoneId,
  );
  const [microphones, setMicrophones] = useState<AudioInputDevice[]>([]);
  const [isLoadingMicrophones, setIsLoadingMicrophones] = useState(true);

  const loadMicrophones = async () => {
    setIsLoadingMicrophones(true);
    try {
      setMicrophones(await loadAudioInputDevices());
    } finally {
      setIsLoadingMicrophones(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoadingMicrophones(true);
      try {
        const devices = await loadAudioInputDevices();
        if (!cancelled) {
          setMicrophones(devices);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingMicrophones(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectMicrophone = (deviceId: string | null) => {
    writePreferredMicrophoneId(deviceId);
    setSelectedMicrophoneId(deviceId);
  };

  return (
    <CustomModal isOpen={true} onClose={onClose} data-testid="microphone-settings-modal">
      <Stack
        sx={{
          gap: '30px',
          width: '100%',
          maxWidth: '700px',
          padding: '20px 0px 30px 0px',
          alignItems: 'flex-start',
        }}
      >
        <Stack>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
            }}
          >
            {i18n._('Microphone')}
          </Typography>
          <Typography
            sx={{
              opacity: 0.7,
            }}
            variant="body2"
          >
            {i18n._('Choose the microphone used for speaking practice')}
          </Typography>
        </Stack>

        <Stack
          sx={{
            width: '100%',
            backgroundColor: 'rgba(32, 40, 50, 0.21)',
            borderRadius: '8px',
            boxShadow: '0 0 0 1px rgba(250, 250, 250, 0.1)',
            overflow: 'hidden',
          }}
        >
          {isLoadingMicrophones && (
            <Typography
              sx={{
                padding: '15px 20px',
                opacity: 0.7,
              }}
            >
              {i18n._('Loading…')}
            </Typography>
          )}

          {!isLoadingMicrophones && (
            <MicrophoneOption
              label={i18n._('System default')}
              isSelected={!selectedMicrophoneId}
              isFirst
              isLast={microphones.length === 0}
              onClick={() => selectMicrophone(null)}
            />
          )}

          {!isLoadingMicrophones &&
            microphones.map((mic, index) => (
              <MicrophoneOption
                key={mic.deviceId}
                label={mic.label}
                isSelected={selectedMicrophoneId === mic.deviceId}
                isFirst={false}
                isLast={index === microphones.length - 1}
                onClick={() => selectMicrophone(mic.deviceId)}
              />
            ))}

          {!isLoadingMicrophones && microphones.length === 0 && (
            <Typography
              variant="caption"
              sx={{
                padding: '0 20px 15px 20px',
                opacity: 0.7,
              }}
            >
              {i18n._('No microphones found. Allow microphone access and try again.')}
            </Typography>
          )}
        </Stack>

        {!isLoadingMicrophones && microphones.length === 0 && (
          <Button variant="outlined" color="info" onClick={() => void loadMicrophones()}>
            {i18n._('Try again')}
          </Button>
        )}

        <Button
          size="large"
          color="info"
          variant="contained"
          startIcon={<Check />}
          onClick={onClose}
        >
          {i18n._('Done')}
        </Button>
      </Stack>
    </CustomModal>
  );
};

const MicrophoneOption = ({
  label,
  isSelected,
  isFirst,
  isLast,
  onClick,
}: {
  label: string;
  isSelected: boolean;
  isFirst: boolean;
  isLast: boolean;
  onClick: () => void;
}) => {
  return (
    <Button
      onClick={onClick}
      aria-pressed={isSelected}
      sx={{
        borderTopLeftRadius: isFirst ? '8px' : '0px',
        borderTopRightRadius: isFirst ? '8px' : '0px',
        borderBottomLeftRadius: isLast ? '8px' : '0px',
        borderBottomRightRadius: isLast ? '8px' : '0px',
        padding: '15px 20px',
        justifyContent: 'flex-start',
        gap: '12px',
        color: '#fff',
        borderTop: isFirst ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
        '@media (max-width: 700px)': {
          ':hover': {
            backgroundColor: 'rgba(250, 0, 0, 0)',
          },
        },
      }}
    >
      <Stack
        sx={{
          width: '20px',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isSelected ? <Check size={16} /> : null}
      </Stack>
      <Typography align="left">{label}</Typography>
    </Button>
  );
};
