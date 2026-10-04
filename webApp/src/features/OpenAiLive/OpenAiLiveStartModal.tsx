'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { ArrowRight, ChevronDown, ChevronUp, Pause, Play } from 'lucide-react';
import { CustomModal } from '@/features/uiKit/Modal/CustomModal';
import { ModalHeader } from '@/features/uiKit/Modal/ModalHeader';
import { ChoiceRadio } from './ChoiceRadio';
import { OpenAiLiveMode } from './types';
import {
  OPEN_AI_LIVE_VOICES,
  OpenAiLiveVoiceId,
  openAiLiveVoiceName,
  openAiLiveVoiceSampleSrc,
  readStoredOpenAiLiveVoice,
  storeOpenAiLiveVoice,
} from './voices';

const surface = '#141920';
const text = '#eaf3f6';
const muted = '#9aabbc';
const meta = '#8b9bab';
const accent = '#53bef5';
const buttonBlue = '#36afed';
const PREVIEW_VOICE_COUNT = 4;

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

const StickyChoiceBar = ({
  label,
  value,
  action,
  testId,
  onAction,
}: {
  label: string;
  value: string;
  action: string;
  testId?: string;
  onAction: () => void;
}) => (
  <Stack
    sx={{
      position: 'fixed',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 5,
      alignItems: 'center',
      backgroundColor: surface,
      borderTop: '1px solid #28323e',
      padding: '16px 20px 20px',
      '@media (max-width: 600px)': {
        padding: '14px 16px 16px',
      },
    }}
  >
    <Stack
      direction="row"
      sx={{
        width: '100%',
        maxWidth: '700px',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
      }}
    >
      <Stack sx={{ gap: '2px', minWidth: 0 }}>
        <Typography sx={{ fontSize: '13px', color: meta }}>{label}</Typography>
        <Typography sx={{ fontSize: '16px', fontWeight: 700, color: text }}>{value}</Typography>
      </Stack>
      <Button
        data-testid={testId}
        onClick={onAction}
        sx={{
          flexShrink: 0,
          backgroundColor: buttonBlue,
          color: '#0d1d27',
          fontWeight: 700,
          fontSize: '16px',
          textTransform: 'none',
          borderRadius: '8px',
          minHeight: '48px',
          padding: '10px 18px',
          gap: '8px',
          boxShadow: 'none',
          '&:hover': { backgroundColor: '#2ea3e0', boxShadow: 'none' },
        }}
      >
        {action}
        <ArrowRight size={18} strokeWidth={2.25} />
      </Button>
    </Stack>
  </Stack>
);

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
  const [showAllVoices, setShowAllVoices] = useState(false);
  const [playingVoice, setPlayingVoice] = useState<OpenAiLiveVoiceId | null>(null);
  const [hearError, setHearError] = useState<string | null>(null);

  useEffect(() => {
    const stored = readStoredOpenAiLiveVoice();
    onVoice(stored);
    if (OPEN_AI_LIVE_VOICES.findIndex((option) => option.id === stored) >= PREVIEW_VOICE_COUNT) {
      setShowAllVoices(true);
    }
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

  const visibleVoices = showAllVoices
    ? OPEN_AI_LIVE_VOICES
    : OPEN_AI_LIVE_VOICES.slice(0, PREVIEW_VOICE_COUNT);
  const lessonTitle = mode === 'grammar' ? i18n._('Fix my grammar') : i18n._('Just talk');

  return (
    <CustomModal
      isOpen
      onClose={onClose}
      backgroundColor={surface}
      desktopPadding="28px 20px 120px"
      mobilePadding="20px 16px 120px"
      data-testid="open-ai-live-start-modal"
    >
      <Stack sx={{ width: '100%', maxWidth: '700px' }}>
        {step === 0 ? (
          <Stack sx={{ width: '100%' }}>
            <ModalHeader
              title={i18n._('Choose a teacher')}
              subtitle={i18n._('Pick a voice. You can hear a short sample first.')}
            />

            <Typography sx={{ marginTop: '28px', color: meta }}>
              {i18n._("Teacher's voice")}
            </Typography>

            <Box
              sx={{
                marginTop: '12px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                '@media (max-width: 600px)': { gridTemplateColumns: '1fr' },
              }}
            >
              {visibleVoices.map((option) => {
                const selected = voice === option.id;
                const playing = playingVoice === option.id;
                return (
                  <Box
                    key={option.id}
                    sx={{
                      boxSizing: 'border-box',
                      borderRadius: '10px',
                      borderStyle: 'solid',
                      borderWidth: selected ? '2px' : '1px',
                      borderColor: selected ? accent : '#303c49',
                      backgroundColor: selected ? '#172a3b' : '#18202a',
                      padding: selected ? '12px 12px 12px 14px' : '13px 13px 13px 15px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      color: text,
                    }}
                  >
                    <Box
                      component="button"
                      type="button"
                      aria-pressed={selected}
                      onClick={() => chooseVoice(option.id)}
                      sx={{
                        appearance: 'none',
                        font: 'inherit',
                        textAlign: 'left',
                        cursor: 'pointer',
                        flex: 1,
                        minWidth: 0,
                        border: 'none',
                        background: 'none',
                        color: 'inherit',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                      }}
                    >
                      <ChoiceRadio selected={selected} />
                      <Stack sx={{ gap: '2px', minWidth: 0 }}>
                        <Typography
                          component="span"
                          sx={{ fontSize: '16px', fontWeight: 700, lineHeight: 1.2, color: text }}
                        >
                          {option.name}
                        </Typography>
                        <Typography
                          component="span"
                          sx={{ fontSize: '13px', lineHeight: 1.3, color: muted }}
                        >
                          {voiceDetail(option.id, i18n)}
                        </Typography>
                      </Stack>
                    </Box>
                    <Box
                      component="button"
                      type="button"
                      data-testid={`open-ai-live-hear-${option.id}`}
                      aria-label={
                        playing
                          ? i18n._('Playing {name}', { name: option.name })
                          : i18n._('Hear {name}', { name: option.name })
                      }
                      onClick={() => {
                        if (playing) {
                          audioRef.current?.pause();
                          setPlayingVoice(null);
                          return;
                        }
                        hear(option.id);
                      }}
                      sx={{
                        width: 36,
                        height: 36,
                        flexShrink: 0,
                        borderRadius: '50%',
                        border: '1px solid',
                        borderColor: playing ? accent : '#3a4d60',
                        backgroundColor: 'transparent',
                        color: playing ? accent : text,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      {playing ? (
                        <Pause size={14} fill="currentColor" />
                      ) : (
                        <Play size={14} fill="currentColor" style={{ marginLeft: 2 }} />
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>

            <Button
              onClick={() => setShowAllVoices((open) => !open)}
              sx={{
                alignSelf: 'center',
                marginTop: '18px',
                textTransform: 'none',
                color: muted,
                fontWeight: 500,
                gap: '6px',
              }}
            >
              {showAllVoices
                ? i18n._('Show fewer voices')
                : i18n._('Show all {count} voices', { count: OPEN_AI_LIVE_VOICES.length })}
              {showAllVoices ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>
            {hearError ? (
              <Typography sx={{ color: '#ffb4b4', textAlign: 'center' }}>{hearError}</Typography>
            ) : null}
          </Stack>
        ) : (
          <Stack sx={{ width: '100%', gap: '28px' }}>
            <ModalHeader
              title={i18n._('Choose a lesson')}
              subtitle={i18n._('How should the teacher help while you talk?')}
            />
            <Stack sx={{ gap: '12px' }}>
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
            </Stack>
          </Stack>
        )}
      </Stack>

      {step === 0 ? (
        <StickyChoiceBar
          label={i18n._('Your teacher')}
          value={openAiLiveVoiceName(voice)}
          action={i18n._('Continue')}
          onAction={() => setStep(1)}
        />
      ) : (
        <StickyChoiceBar
          label={i18n._('Your lesson')}
          value={lessonTitle}
          action={i18n._('Start conversation')}
          testId="open-ai-live-confirm-start"
          onAction={onStart}
        />
      )}
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
  <Box
    data-testid={testId}
    aria-pressed={selected}
    component="button"
    type="button"
    onClick={onClick}
    sx={{
      appearance: 'none',
      font: 'inherit',
      textAlign: 'left',
      cursor: 'pointer',
      width: '100%',
      boxSizing: 'border-box',
      borderRadius: '10px',
      borderStyle: 'solid',
      borderWidth: selected ? '2px' : '1px',
      borderColor: selected ? accent : '#303c49',
      backgroundColor: selected ? '#172a3b' : '#18202a',
      padding: selected ? '16px' : '17px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      color: text,
    }}
  >
    <ChoiceRadio selected={selected} />
    <Stack sx={{ gap: '4px', minWidth: 0 }}>
      <Typography sx={{ fontSize: '16px', fontWeight: 700, color: text }}>{title}</Typography>
      <Typography sx={{ fontSize: '14px', lineHeight: 1.45, color: muted }}>
        {description}
      </Typography>
    </Stack>
  </Box>
);
