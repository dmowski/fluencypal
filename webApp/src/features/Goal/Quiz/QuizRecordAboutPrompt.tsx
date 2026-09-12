'use client';

import { useEffect } from 'react';
import { Stack } from '@mui/material';
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
}: {
  text: string;
  pausePlayback?: boolean;
}) => {
  const { i18n } = useLingui();
  const settings = useSettings();
  const conversationAudio = useConversationAudio();
  const { selectedVoice } = useQuizTeacherVoice();
  const voice = selectedVoice || FALLBACK_VOICE;
  const avatar = voiceAvatarMap[voice];
  const instructions = `${getVoiceSpeedInstruction(settings.aiVoiceSpeed)} ${avatar.voiceInstruction}`.trim();

  useEffect(() => {
    if (!pausePlayback) {
      return;
    }
    conversationAudio.interrupt();
  }, [pausePlayback]);

  return (
    <Stack
      data-testid="quiz-record-about-prompt"
      sx={{
        gap: '8px',
      }}
    >
      <AudioPlayIcon
        type="button"
        buttonLabel={i18n._('Hear the question')}
        text={text}
        customVoice={voice}
        customInstructions={instructions}
        cache
        autoPlay
        analyticsId="hear-question"
      />
    </Stack>
  );
};
