'use client';

import { Stack } from '@mui/material';
import { useLingui } from '@lingui/react';
import { ArrowRight } from 'lucide-react';
import { InfoStep } from '../../Survey/InfoStep';
import { FooterButton } from '../../Survey/FooterButton';
import { useAuth } from '@/features/Auth/useAuth';
import { useSettings } from '@/features/Settings/useSettings';
import { VoiceSpeedSelector } from '@/features/Settings/VoiceSpeedSelector';
import { SelectTeacher } from '@/features/Conversation/CallMode/SelectTeacher';
import { useQuizTeacherVoice } from './useQuizTeacherVoice';

export const TeacherSelectionQuizStep = ({
  onContinue,
  isStepLoading,
}: {
  onContinue: () => void;
  isStepLoading: boolean;
}) => {
  const { i18n } = useLingui();
  const auth = useAuth();
  const settings = useSettings();
  const { selectedVoice, savedVoice, selectVoice } = useQuizTeacherVoice();
  const isAuthReady = Boolean(auth.uid);
  const canContinue = isAuthReady && Boolean(savedVoice);
  const continueDisabled = isStepLoading || !canContinue;

  return (
    <>
      <InfoStep
        title={i18n._(`Choose your interlocutor`)}
        subTitle={i18n._(`A voice and style that suits you`)}
        hideActions
        subComponent={
          <Stack
            data-testid="quiz-teacher-selection"
            data-analytics-screen="quiz.teacherSelection"
            sx={{
              paddingTop: '20px',
              gap: '20px',
              alignItems: 'flex-start',
            }}
          >
            <SelectTeacher
              selectedVoice={selectedVoice}
              onSelectVoice={selectVoice}
              voiceSpeed={settings.aiVoiceSpeed}
            />

            <VoiceSpeedSelector />
          </Stack>
        }
        onClick={onContinue}
        disabled={continueDisabled}
        isStepLoading={isStepLoading || !isAuthReady}
      />
      <FooterButton
        disabled={continueDisabled}
        onClick={onContinue}
        title={i18n._(`Continue`)}
        endIcon={<ArrowRight />}
        analyticsId="quiz-next"
      />
    </>
  );
};
