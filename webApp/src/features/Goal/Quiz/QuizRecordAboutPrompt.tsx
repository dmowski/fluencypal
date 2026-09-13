'use client';

import { useEffect } from 'react';
import { Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { AudioPlayIcon } from '@/features/Audio/AudioPlayIcon';
import { useConversationAudio } from '@/features/Audio/useConversationAudio';
import { voiceAvatarMap } from '@/features/Conversation/CallMode/voiceAvatar';
import { getVoiceSpeedInstruction } from '@/features/Conversation/CallMode/voiceSpeed';
import { useSettings } from '@/features/Settings/useSettings';
import { AiVoice } from '@/features/Ai/ai';
import { useQuizTeacherVoice } from './useQuizTeacherVoice';

const FALLBACK_VOICE: AiVoice = 'shimmer';

export const QuizRecordAboutPrompt = ({
  text,
  pausePlayback = false,
  autoPlay = true,
  buttonLabel,
  variant = 'question',
}: {
  text: string;
  pausePlayback?: boolean;
  autoPlay?: boolean;
  buttonLabel?: string;
  variant?: 'question' | 'reaction';
}) => {
  const { i18n } = useLingui();
  const settings = useSettings();
  const conversationAudio = useConversationAudio();
  const { selectedVoice } = useQuizTeacherVoice();
  const voice = selectedVoice || FALLBACK_VOICE;
  const avatar = voiceAvatarMap[voice];
  const instructions = `${getVoiceSpeedInstruction(settings.aiVoiceSpeed)} ${avatar.voiceInstruction}`.trim();

  useEffect(() => {
    if (!pausePlayback && autoPlay) {
      return;
    }
    conversationAudio.interrupt();
  }, [autoPlay, pausePlayback]);

  return (
    <Stack
      data-testid="quiz-record-about-prompt"
      data-variant={variant}
      sx={{
        gap: '8px',
      }}
    >
      {variant === 'reaction' ? (
        <Stack
          direction="row"
          sx={{
            alignItems: 'flex-start',
            gap: '4px',
          }}
        >
          <AudioPlayIcon
            type="icon"
            text={text}
            customVoice={voice}
            customInstructions={instructions}
            cache
            autoPlay={autoPlay}
          />
          <Typography variant="body1">{text}</Typography>
        </Stack>
      ) : (
        <AudioPlayIcon
          type="button"
          buttonLabel={buttonLabel ?? i18n._('Hear the question')}
          text={text}
          customVoice={voice}
          customInstructions={instructions}
          cache
          autoPlay={autoPlay}
          analyticsId="hear-question"
        />
      )}
    </Stack>
  );
};
