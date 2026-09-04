'use client';

import { Stack } from '@mui/material';
import { useLingui } from '@lingui/react';
import { InfoStep } from '../../Survey/InfoStep';
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
  const settings = useSettings();
  const { selectedVoice, selectVoice } = useQuizTeacherVoice();

  return (
    <InfoStep
      title={i18n._(`Choose your interlocutor`)}
      subTitle={i18n._(`A voice and style that suits you`)}
      actionButtonTitle={i18n._(`Continue`)}
      subComponent={
        <Stack
          data-testid="quiz-teacher-selection"
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
      disabled={isStepLoading || !selectedVoice}
      isStepLoading={isStepLoading}
    />
  );
};
