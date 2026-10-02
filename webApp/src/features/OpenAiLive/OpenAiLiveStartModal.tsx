'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, Stack, Step, StepButton, Stepper, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { ArrowRight, Volume2 } from 'lucide-react';
import { CustomModal } from '@/features/uiKit/Modal/CustomModal';
import { OpenAiLiveMode } from './types';
import {
  OPEN_AI_LIVE_VOICES,
  OpenAiLiveVoiceId,
  openAiLiveVoiceSampleSrc,
  readStoredOpenAiLiveVoice,
  storeOpenAiLiveVoice,
} from './voices';

const voiceDetail = (voiceId: OpenAiLiveVoiceId, i18n: { _: (text: string) => string }) => {
  if (voiceId === 'marin') return i18n._('Clear and calm');
  if (voiceId === 'gleam') return i18n._('Warm, North American');
  if (voiceId === 'meridian') return i18n._('Steady, North American');
  if (voiceId === 'vesper') return i18n._('British');
  if (voiceId === 'willow' || voiceId === 'stone') return i18n._('Irish');
  if (voiceId === 'quartz' || voiceId === 'ripple') return i18n._('Australian');
  if (voiceId === 'delta' || voiceId === 'cinder') return i18n._('Southern U.S.');
  if (voiceId === 'bossa' || voiceId === 'tempo') return i18n._('Brazilian Portuguese');
  return i18n._('Filipino English');
};

export const OpenAiLiveStartModal = ({
  mode,
  voice,
  onMode,
  onVoice,
  onStart,
  onClose,
}: {
  mode: OpenAiLiveMode;
  voice: OpenAiLiveVoiceId;
  onMode: (mode: OpenAiLiveMode) => void;
  onVoice: (voice: OpenAiLiveVoiceId) => void;
  onStart: () => void;
  onClose: () => void;
}) => {
  const { i18n } = useLingui();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [step, setStep] = useState(0);
  const [playingVoice, setPlayingVoice] = useState<OpenAiLiveVoiceId | null>(null);
  const [hearError, setHearError] = useState<string | null>(null);
  const steps = [i18n._('Teacher'), i18n._('Lesson')];

  useEffect(() => {
    onVoice(readStoredOpenAiLiveVoice());
    return () => {
      audioRef.current?.pause();
    };
  }, [onVoice]);

  const chooseVoice = (voiceId: OpenAiLiveVoiceId) => {
    storeOpenAiLiveVoice(voiceId);
    onVoice(voiceId);
  };

  const hear = (voiceId: OpenAiLiveVoiceId) => {
    audioRef.current?.pause();
    setHearError(null);
    const audio = new Audio(openAiLiveVoiceSampleSrc(voiceId));
    audioRef.current = audio;
    setPlayingVoice(voiceId);
    const fail = () => {
      setPlayingVoice(null);
      setHearError(i18n._("Couldn't play that voice."));
    };
    audio.addEventListener('ended', () => setPlayingVoice(null));
    audio.addEventListener('error', fail);
    void audio.play().catch(fail);
  };

  return (
    <CustomModal isOpen onClose={onClose} data-testid="open-ai-live-start-modal">
      <Stack sx={{ width: '100%', maxWidth: '700px', gap: '40px' }}>
        <Stepper activeStep={step} sx={{ width: '100%' }}>
          {steps.map((label, index) => (
            <Step key={label} completed={step > index}>
              <StepButton
                onClick={() => {
                  if (index < step) setStep(index);
                }}
              >
                {label}
              </StepButton>
            </Step>
          ))}
        </Stepper>

        {step === 0 ? (
          <Stack sx={{ gap: '24px', width: '100%' }}>
            <Stack sx={{ gap: '6px' }}>
              <Typography variant="h5" component="h2">
                {i18n._('Choose a teacher')}
              </Typography>
              <Typography sx={{ opacity: 0.7 }}>
                {i18n._('Pick a voice. You can hear a short sample first.')}
              </Typography>
            </Stack>
            <Stack
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                '@media (max-width: 600px)': { gridTemplateColumns: '1fr' },
              }}
            >
              {OPEN_AI_LIVE_VOICES.map((option) => {
                const selected = voice === option.id;
                return (
                  <Stack
                    key={option.id}
                    sx={{
                      gap: '8px',
                      padding: '14px',
                      borderRadius: '7px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      color: '#fff',
                      backgroundColor: 'rgba(32, 137, 241, 0.1)',
                      boxShadow: selected
                        ? '0px 0px 0px 2px rgba(0, 185, 252, 1)'
                        : '0px 0px 0px 1px rgba(255,255,255,0.08)',
                    }}
                    role="button"
                    tabIndex={0}
                    onClick={() => chooseVoice(option.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        chooseVoice(option.id);
                      }
                    }}
                  >
                    <Typography sx={{ fontWeight: 700 }}>{option.name}</Typography>
                    <Typography sx={{ opacity: 0.7, fontSize: '14px' }}>
                      {voiceDetail(option.id, i18n)}
                    </Typography>
                    <Button
                      data-testid={`open-ai-live-hear-${option.id}`}
                      size="small"
                      startIcon={<Volume2 size={16} />}
                      onClick={(event) => {
                        event.stopPropagation();
                        hear(option.id);
                      }}
                      sx={{ alignSelf: 'flex-start', textTransform: 'none', color: '#fff' }}
                    >
                      {playingVoice === option.id ? i18n._('Playing') : i18n._('Hear')}
                    </Button>
                  </Stack>
                );
              })}
            </Stack>
            {hearError ? <Typography sx={{ color: '#ffb4b4' }}>{hearError}</Typography> : null}
            <Button
              color="info"
              variant="contained"
              size="large"
              endIcon={<ArrowRight />}
              onClick={() => setStep(1)}
              sx={{ alignSelf: 'flex-start', padding: '12px 40px', fontWeight: 600 }}
            >
              {i18n._('Continue')}
            </Button>
          </Stack>
        ) : (
          <Stack sx={{ gap: '24px', width: '100%' }}>
            <Stack sx={{ gap: '6px' }}>
              <Typography variant="h5" component="h2">
                {i18n._('Choose a lesson')}
              </Typography>
              <Typography sx={{ opacity: 0.7 }}>
                {i18n._('How should the teacher help while you talk?')}
              </Typography>
            </Stack>
            <ModeChoice
              selected={mode === 'talk'}
              title={i18n._('Just talk')}
              description={i18n._('A normal chat. I will not stop you to teach.')}
              testId="open-ai-live-mode-talk"
              onClick={() => onMode('talk')}
            />
            <ModeChoice
              selected={mode === 'grammar'}
              title={i18n._('Fix my grammar')}
              description={i18n._(
                'When you make a mistake, I explain the rule and you try the sentence again.',
              )}
              testId="open-ai-live-mode-grammar"
              onClick={() => onMode('grammar')}
            />
            <Button
              data-testid="open-ai-live-confirm-start"
              color="info"
              variant="contained"
              size="large"
              endIcon={<ArrowRight />}
              onClick={onStart}
              sx={{ alignSelf: 'flex-start', padding: '12px 40px', fontWeight: 600 }}
            >
              {i18n._('Start conversation')}
            </Button>
          </Stack>
        )}
      </Stack>
    </CustomModal>
  );
};

const ModeChoice = ({
  selected,
  title,
  description,
  testId,
  onClick,
}: {
  selected: boolean;
  title: string;
  description: string;
  testId: string;
  onClick: () => void;
}) => (
  <Stack
    data-testid={testId}
    aria-pressed={selected}
    component="button"
    type="button"
    onClick={onClick}
    sx={{
      alignItems: 'flex-start',
      textAlign: 'left',
      color: '#fff',
      borderRadius: '7px',
      padding: '18px 16px',
      gap: '4px',
      border: 'none',
      cursor: 'pointer',
      backgroundColor: 'rgba(32, 137, 241, 0.1)',
      boxShadow: selected
        ? '0px 0px 0px 2px rgba(0, 185, 252, 1)'
        : '0px 0px 0px 1px rgba(255,255,255,0.08)',
    }}
  >
    <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
    <Typography sx={{ opacity: 0.75 }}>{description}</Typography>
  </Stack>
);
